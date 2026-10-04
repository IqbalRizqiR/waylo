# Waylo — Technical Requirements Document (TRD)

Status: Draft v1.0
Depends on: `docs/PRD.md` (scope), `docs/ARCHITECTURE.md` (system design), `docs/RULE.md` (conventions)

## 1. Purpose

This document defines the technical requirements Waylo must satisfy: stack, integrations, non-functional requirements, environments, and API/data expectations. It translates the PRD into engineering-testable requirements.

## 2. Technology stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript everywhere | One language across web/api/shared reduces context-switching and lets zod schemas be shared |
| Frontend | Next.js (App Router) | SSR for SEO on public pages (job listings, courses), route groups map cleanly to roles |
| UI | Tailwind CSS + shadcn/ui | Fast to build a consistent design system on top of Figma tokens |
| Data fetching | TanStack Query | Caching, optimistic updates for progress/enrollment actions |
| Forms/validation | react-hook-form + zod | Shared zod schemas between client validation and API validation |
| i18n | next-intl | Product copy is mixed ID/EN; must be centralized, not hardcoded |
| Backend | Express (modular monolith) | Team is Express-experienced; monolith is simpler to ship and split later |
| ORM/DB | Prisma + PostgreSQL | Relational data (skill graph, hiring pipeline) fits relational modeling; Prisma migrations are auditable |
| Cache/Queue | Redis + BullMQ | Async jobs: emails, PDF certificates, roadmap recomputation |
| Object storage | S3-compatible (e.g. MinIO or a cloud provider) | Certificates, project submissions, course media |
| Search | Postgres full-text search v1; Meilisearch or pgvector if talent/job search scales | Avoid premature complexity |
| Payments | Midtrans or Xendit | Indonesian market coverage, supports common local payment methods |
| Email | Resend or Amazon SES | Transactional email (invites, verification, notifications) |
| Auth | JWT access token + httpOnly refresh cookie, optional Google OAuth | Standard, works across web/mobile-web |
| CI/CD | GitHub Actions → Docker → Docker Compose/Nginx | Matches team's deployment target (Jagoan Hosting infra) |
| Monitoring | Sentry (errors) + basic uptime/log aggregation | Minimum viable observability for launch |

## 3. Functional requirements by module

Numbering matches the module list in `docs/ARCHITECTURE.md`.

### 3.1 Auth & RBAC
- FR-1: System supports 5 roles: learner, mentor, learning_provider, company_member, admin. A company_member additionally has a sub-role (owner, recruiter, interviewer).
- FR-2: JWT access token (short-lived, ~15 min) + refresh token in httpOnly cookie (rotating).
- FR-3: Route/middleware-level role guard on every API route and every Next.js route group.
- FR-4: Entitlement middleware (`requirePlan('premium')`) gates premium-only endpoints; must be enforced server-side, never only in the UI.

### 3.2 Skills graph
- FR-5: `Skill`, `Career`, `CareerSkillRequirement` (skill + required proficiency level), `UserSkill` (level, verified boolean, source: assessment/project/mentor).
- FR-6: Skill Gap = required skills of selected Career − verified (or current, per business decision) skills of the Learner. Must be a pure, unit-tested function, callable independently of any specific UI flow.
- FR-7: Skill graph changes (new skill added to a career) must trigger recomputation of affected learners' roadmaps via a background job, not inline in the request.

### 3.3 Assessment
- FR-8: Two distinct assessment types: `career_interest` (produces a Career Recommendation) and `skill` (basic/advanced, produces a skill-level result feeding UserSkill).
- FR-9: Assessment attempts are versioned (question set can change without invalidating historical results).
- FR-10: Scoring must support both auto-graded (multiple choice) and mentor-graded (open-ended/project-linked) questions.

### 3.4 Roadmap & Learning
- FR-11: Roadmap is generated from Skill Gap + available Courses/Mentoring/Projects mapped to each required skill.
- FR-12: Course lifecycle: draft → preview → published → archived. Only published courses appear in roadmaps/search.
- FR-13: Enrollment and LessonProgress tracked per learner per course; progress must be resumable and drive the "Progress Belajar" dashboard.
- FR-14: A Course can be authored by a Mentor, a Company (private to them, see PRD §10.5 pending decision), or a Learning Provider — ownership field required and enforced on edit permissions.

### 3.5 Mentoring
- FR-15: Company → Mentor program invite: pending → accepted/declined. Accepted invites create an Assigned Program with a Candidates List.
- FR-16: Mentoring sessions reference an external meeting link (v1); session has status (scheduled/completed/no-show) and an optional Review/Recommendation output.
- FR-17: A Mentor's Recommendation on a company-sponsored candidate must be visible in that Company's Recruitment Proses (pipeline) — exact integration point pending PRD decision §10.9.

### 3.6 Projects & Certificates
- FR-18: Project submission → Mentor review → approve/reject/request-changes. Approval can set `UserSkill.verified = true` for mapped skills (pending PRD decision §10.3).
- FR-19: Certificate issuance triggers a background job to render a PDF and store it in object storage; certificate has a public verification URL.

### 3.7 Company / Recruitment
- FR-20: Job posting includes required skills with minimum level, mapped to the same Skill entity used elsewhere.
- FR-21: Talent Pool query must filter/rank by verified skill match against a Job's requirements; only learners who have opted in (per §3.9) are queryable.
- FR-22: Application pipeline is a single state machine (see `docs/ARCHITECTURE.md` §State Machines) shared by both the Free (general screening) and Premium (mentor screening) paths, differing only in which states are traversed.
- FR-23: Company Free/Trial vs Subscribe determines whether Premium Recruitment (and thus Hire-a-Mentor) is available; enforced via entitlement middleware, not client-side.

### 3.8 Billing
- FR-24: Subscription state machine: trial → active → past_due → cancelled, driven by payment gateway webhooks (not just client confirmation).
- FR-25: All payment mutations are idempotent (idempotency key per gateway event) to survive webhook retries.
- FR-26: Mentor payout ledger: every company-sponsored screening creates a payable line item for the mentor; payout batch process is a separate, auditable job.

### 3.9 Privacy & consent
- FR-27: A Learner's profile is not visible in any Company's Talent Pool search until the Learner explicitly opts in; opt-in can be scoped to "all companies" or later restricted to specific companies/jobs.
- FR-28: All access to a Learner's assessment answers and personal data by a Company or Admin must be audit-logged (who, when, which record).
- FR-29: Data retention and deletion (right-to-erasure) must be supported per Indonesia's UU PDP — target for a later phase, but the schema must not make this structurally impossible (e.g. avoid irreversibly mixing PII into analytics tables).

### 3.10 Admin (spec pending — see PRD §11)
- FR-30: At minimum, Admin must be able to CRUD Skill, Career, CareerSkillRequirement, and moderate/approve Courses and Mentor accounts. Full Admin UI is out of MVP; seed scripts/DB access are an acceptable substitute for MVP only.

## 4. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | P95 API response < 400ms for read endpoints under expected MVP load (~hundreds of concurrent users); job/queue-backed for anything involving PDF generation or bulk recompute |
| Availability | Target 99.5% for MVP; document planned maintenance windows |
| Scalability | Modular monolith must allow a module (e.g. Talent Pool search) to be extracted into its own service without a rewrite — enforce module boundaries strictly from day one (see `docs/ARCHITECTURE.md`) |
| Security | OWASP ASVS baseline: input validation via zod at the API boundary, parameterized queries via Prisma, rate limiting on auth and assessment-submission endpoints, secrets in a vault/env manager, not in code |
| Data protection | PII encrypted at rest where the storage layer supports it; role-based field-level access (e.g. a Company never receives a Learner's raw email until an application/interview stage) |
| i18n | All user-facing strings via next-intl; Indonesian is the default locale, English secondary |
| Accessibility | WCAG 2.1 AA target for core learner/company flows |
| Observability | Structured logs (no PII), error tracking (Sentry), basic dashboards for queue health and API error rate |
| Testing | Unit tests required for skill-gap calculation and all state-machine transitions; integration tests for auth, application pipeline, and payment webhooks; CI must block merge on failing tests |
| Browser support | Latest 2 versions of Chrome, Safari, Edge, Firefox; mobile-responsive (many learners will be on mobile web) |

## 5. Integration requirements

| Integration | Purpose | Notes |
|---|---|---|
| Midtrans/Xendit | Learner Premium subscription, Company Subscription, mentor screening fee | Webhook endpoint must verify signature; all events logged before processing |
| Resend/SES | Transactional email: verification, invites, session reminders, certificate issued | Templates versioned in repo |
| Google OAuth | Login/Register | Optional for v1 but recommended to reduce signup friction |
| External video (Meet/Zoom/Jitsi) | Mentoring sessions | v1 stores an external link only; no in-app video infra required |
| Object storage (S3-compatible) | Certificates, submissions, course media, profile images | Signed URLs, not public buckets, for PII-adjacent files |

## 6. Data requirements summary

See `docs/ARCHITECTURE.md` §Data Model for the full entity list. Key constraints:
- Every `UserSkill` must reference a `source` (assessment_id, project_id, or mentor_review_id) so verification is always traceable, never a bare boolean flip.
- Every state-machine entity (`Application`, `Course`, `MentorInvite`, `Subscription`) stores its history (`*StageHistory` or an audit table), not just current status, to support analytics and disputes.
- Soft-delete (not hard-delete) for anything that could be referenced by historical records (Course, Job, Assessment) to keep history intact.

## 7. Environments

| Env | Purpose | Notes |
|---|---|---|
| local | Developer machine | Docker Compose: postgres, redis, minio |
| staging | QA / stakeholder review | Mirrors production config, uses payment gateway sandbox |
| production | Live | Payment gateway live keys, real email sending, backups enabled |

Environment variables must be documented in `.env.example` and never committed with real values.

## 8. Acceptance criteria for "MVP done"

1. A Learner can complete: onboarding → career assessment → recommendation → skill gap → roadmap → enroll in a course → complete it → get a project reviewed by a mentor → have a verified skill.
2. A Company can: post a job with required skills → see matching, opted-in candidates in the Talent Pool → move a candidate through the pipeline → hire.
3. Auth and RBAC enforced on every route, verified by integration tests.
4. No payment integration required for MVP acceptance (mocked), but the entitlement middleware must exist and be wired for a later flip to real billing.
5. CI pipeline green: lint, typecheck, unit tests, integration tests.
