# Waylo — Architecture

Status: Draft v1.0
Related: `docs/PRD.md` (what), `docs/TRD.md` (requirements), `docs/RULE.md` (conventions)

## 1. Architectural approach

**Modular monolith**, not microservices, for v1. One Express app (`apps/api`), one Next.js app (`apps/web`), one Postgres database, module boundaries enforced by folder structure and code review rather than network calls. This is the fastest path to a working product for a small team, and any module (most likely Talent Pool search or Recommendation) can be extracted into its own service later without a rewrite, provided module boundaries are respected from day one.

## 2. Monorepo layout

```
apps/
  web/                    Next.js frontend
    app/(auth)/
    app/(learner)/
    app/(mentor)/
    app/(company)/
    app/(admin)/
    components/
    lib/
  api/                    Express backend
    src/modules/<module>/
      controller.ts
      service.ts
      repository.ts
      routes.ts
      schema.ts           (imports zod schemas from packages/shared)
    src/middleware/        auth, rbac, entitlements, error-handler, audit-log
    src/jobs/              BullMQ workers (email, pdf, roadmap-recompute, payout)
packages/
  shared/                 zod schemas + shared TS types, role/permission constants
  db/                     Prisma schema, migrations, seed
docs/
```

Rule: a module's `repository.ts` is never imported outside that module. Cross-module reads go through the other module's `service.ts`. Cross-module side effects (e.g. "when a Project is approved, maybe mark a UserSkill verified") go through a lightweight in-process domain event, not a direct function call chain three modules deep — this keeps the boundary extractable later.

## 3. Frontend architecture

Next.js App Router route groups map 1:1 to the five actors:

```
app/(auth)/login, register, onboarding
app/(learner)/dashboard, career-assessment, skill-gap, roadmap, learning, mentoring, projects, assessments, certificates, profile, job-match, subscription
app/(mentor)/dashboard, courses, programs, mentoring, reviews, settings
app/(company)/dashboard, talent-pool, assessments, courses, recruitment, jobs, billing, profile
app/(admin)/skills, careers, users, courses-moderation, companies, analytics
```

- A `middleware.ts` role guard checks the session/JWT and redirects unauthorized roles before a route group renders.
- Server components handle initial data fetch (SSR) for SEO-relevant and dashboard pages; client components + TanStack Query handle interactive flows (assessment taking, roadmap drag-through, mentoring scheduling).
- Shared UI (shadcn/ui + Tailwind) lives in `apps/web/components`; role-specific composite components live under each route group.
- Forms use react-hook-form bound to the same zod schema the API validates against (imported from `packages/shared`), so client and server validation cannot drift.

## 4. Backend modules

| Module | Owns |
|---|---|
| auth | login, register, OAuth, token refresh, session |
| users | base user record, role assignment |
| careers | Career entity, CareerSkillRequirement |
| skills | Skill entity, UserSkill, skill-gap calculation service |
| assessments | Assessment, Question, Attempt, Answer, Result (both career_interest and skill types) |
| roadmaps | Roadmap, RoadmapItem generation from skill-gap + catalog |
| courses | Course, Module, Lesson, lifecycle (draft→published→archived) |
| enrollments | Enrollment, LessonProgress |
| mentoring | MentorProgramInvite, MentoringSession, Review, Recommendation |
| projects | Project, Submission, ProjectReview |
| certificates | Certificate issuance + public verification |
| companies | Company, CompanyMember, CompanyProfile |
| jobs | Job, JobSkill, lifecycle |
| applications | Application, ApplicationStageHistory (the hiring pipeline state machine) |
| talent-pool | opt-in registry, search/filter/ranking on verified skills |
| invites | Company→Mentor program invites (distinct from job applications) |
| billing | Plan, Subscription, Payment, Invoice, MentorPayout, webhook handlers |
| notifications | email/queue-driven notifications |
| analytics | read-model aggregation for dashboards (Talent/Assessment/Recruitment Analytics) |
| admin | cross-cutting CRUD/moderation for master data (pending full spec) |

## 5. Core data model

Entities grouped by concern (field-level detail belongs in the Prisma schema, not here):

**Identity**
`User`, `Role`, `LearnerProfile`, `MentorProfile`, `Company`, `CompanyMember`

**Skills graph** (the core domain — keep this small, stable, and heavily tested)
`Skill`, `Career`, `CareerSkillRequirement(skill_id, career_id, required_level)`, `UserSkill(user_id, skill_id, level, verified, source_type, source_id)`

**Learning**
`Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `LearningPath`, `Roadmap`, `RoadmapItem`

**Assessment**
`Assessment(type: career_interest|skill_basic|skill_advanced)`, `Question`, `Attempt`, `Answer`, `Result`

**Mentoring**
`MentorProgramInvite(status: pending|accepted|declined)`, `MentoringSession(status)`, `Review`, `Recommendation`

**Projects & credentials**
`Project`, `Submission`, `ProjectReview`, `Certificate`

**Hiring**
`Job`, `JobSkill`, `Application(status)`, `ApplicationStageHistory`, `Shortlist`, `MentorScreening`, `TalentPoolEntry(user_id, opt_in_scope)`

**Money**
`Plan`, `Subscription(status)`, `Payment`, `Invoice`, `MentorPayout`

Every entity above with a `status`/lifecycle field is a state machine — see §6. Every verification-bearing field (`UserSkill.verified`) must carry a traceable `source`, never a bare toggle (see `docs/TRD.md` §6).

## 6. State machines

### 6.1 Application (hiring pipeline)
```
applied
  → general_screening        (Free path)
  → mentor_screening         (Premium path: Hire Mentor)
      → skill_assessment
      → mentor_review
      → shortlisted
  → hrd_review                (both paths converge here)
  → interview
  → hired | rejected
```
One state machine, two entry sub-paths depending on the Company's plan at the time the job was posted or the candidate was queued. `ApplicationStageHistory` records every transition with actor and timestamp for analytics and dispute resolution.

### 6.2 Course
```
draft → preview → published → archived
```
Only `published` courses are eligible for roadmap inclusion or public search.

### 6.3 MentorProgramInvite
```
pending → accepted | declined
```
`accepted` creates an assigned program + candidate list for that mentor.

### 6.4 Subscription (Learner Premium or Company Subscribe)
```
trial → active → past_due → cancelled
```
Driven by payment gateway webhooks, not client-side confirmation (see `docs/TRD.md` FR-24).

## 7. Auth & RBAC

- JWT access token (short-lived) + httpOnly rotating refresh cookie.
- Roles: `learner`, `mentor`, `learning_provider`, `company_member` (sub-roles: owner, recruiter, interviewer), `admin`.
- Every API route declares its allowed roles; a shared middleware rejects before the controller runs.
- Entitlement middleware (`requirePlan('premium')`) is a separate concern from role — a `company_member` can be authorized by role but blocked by plan. Keep these as two distinct middlewares so free/premium logic never gets duplicated inside business logic.
- Audit log middleware wraps admin actions, payment actions, and any read of a Learner's PII by a Company.

## 8. Skill-gap & recommendation engine

v1 is deliberately simple and deterministic:

```
skill_gap(user, career) =
  career.requirements
    .map(req => ({ skill: req.skill, required: req.level, current: userSkillLevel(user, req.skill) }))
    .filter(x => x.current < x.required || !x.verified)
```

Roadmap generation then maps each gap item to the best-matching published Course/Project/Mentor session tagged with that skill. This is intentionally a plain, testable function — no ML in v1. Revisit with embeddings/ML only once there's enough usage data to justify it (see `docs/PRD.md` §10.6).

## 9. Async processing

BullMQ queues, one worker pool per concern:
- `email` — verification, invites, reminders, certificate-issued notices
- `pdf` — certificate rendering
- `roadmap-recompute` — triggered when the skill graph changes or a learner completes an item
- `payout` — mentor payout batch processing
- `webhook-processing` — payment gateway events, processed idempotently

## 10. Deployment

```
GitHub Actions (lint, typecheck, test, build)
  → Docker image build (web, api)
  → Docker Compose / Nginx reverse proxy on target host
  → Postgres (managed or self-hosted), Redis, S3-compatible storage
```
Staging mirrors production with sandbox payment keys. Rollbacks via previous image tag; database migrations are forward-only and reviewed separately from application deploys.

## 11. Known architectural risks

1. **Admin and Learning Provider are unspecified** — their eventual modules must fit into the module list above without becoming a dumping ground; scope them explicitly before building.
2. **Course ownership ambiguity** (Mentor vs Company vs Provider) affects the `courses` module's permission model — resolve before building course CRUD permissions, not after.
3. **Talent Pool consent** must be enforced at the query layer (`talent-pool` module), not just hidden in the UI — a Company's API access must never be able to list non-opted-in learners even by direct query manipulation.
4. **Payment webhooks** are the highest-risk integration point for data corruption (double-charging, missed activation) — build idempotency and reconciliation tooling before going live with real money.
