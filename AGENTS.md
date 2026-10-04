# AGENTS.md — Waylo

This file tells any AI coding agent (Claude Code, Copilot, Cursor, etc.) how to work in this repository. Read this before touching code. For deeper context read `docs/PRD.md`, `docs/TRD.md`, `docs/ARCHITECTURE.md`, `docs/RULE.md`, and `docs/DESIGN.md`.

## 1. What this project is

Waylo is a two-sided career/talent marketplace with five roles: **Learner**, **Mentor**, **Learning Provider**, **Company/HRD**, **Admin**. Learners discover a career, close a skill gap through a roadmap of courses/mentoring/projects, earn **Verified Skill**, and get matched to jobs. Companies post jobs, browse a Talent Pool filtered on Verified Skill, and hire — optionally paying for mentor-assisted screening. Both sides have Free and Premium tiers.

The single most important concept in the codebase is the **skill graph**: `Career → CareerSkillRequirement → Skill ← UserSkill (verified/unverified)`. Skill gap, roadmap generation, and Talent Pool filtering are all derived from this graph. Treat it as the core domain and keep it in one well-tested module (`packages/db` schema + a `skills` service), not scattered across features.

## 2. Stack

- **Monorepo:** pnpm + Turborepo
- **Frontend:** `apps/web` — Next.js (App Router), TypeScript, Tailwind + shadcn/ui, TanStack Query, react-hook-form + zod, next-intl
- **Backend:** `apps/api` — Express, TypeScript, Prisma, PostgreSQL, Redis + BullMQ
- **Shared:** `packages/shared` — zod schemas and types shared by web and api (single source of truth for request/response shapes)
- **DB:** `packages/db` — Prisma schema, migrations, seed scripts
- **Payments:** Midtrans or Xendit (see `docs/TRD.md` §Payments)
- **Deploy:** Docker Compose, GitHub Actions CI

## 3. Repo layout

```
apps/web/app/(auth)/...
apps/web/app/(learner)/...
apps/web/app/(mentor)/...
apps/web/app/(company)/...
apps/web/app/(admin)/...
apps/api/src/modules/<module>/{controller,service,repository,routes,schema}.ts
packages/shared/src/schemas/<domain>.ts
packages/db/prisma/schema.prisma
packages/db/prisma/seed/
docs/
```

Each Express module is self-contained (controller → service → repository). Do not import one module's repository directly from another module's controller — go through the other module's service, or emit a domain event.

## 4. Before you write code

1. Check `docs/RULE.md` for naming, commit, branch, and API conventions — these are non-negotiable, not suggestions.
2. Check `docs/ARCHITECTURE.md` for module boundaries and the state machines (Application, Course, MentorInvite, Subscription). Do not hand-roll a new status enum without updating that doc.
3. If a request/response shape doesn't exist yet in `packages/shared`, add the zod schema there first, then implement backend and frontend against it. Never let `apps/web` and `apps/api` define the same shape twice.
4. If you're touching the skills graph, roadmap generation, skill-gap calculation, or the Application/hiring state machine, write or update tests first — these are the modules where a silent bug is most costly.

## 5. Commands

```bash
pnpm install
pnpm dev             # runs web + api + db in watch mode (turbo)
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
pnpm test            # unit + integration
pnpm lint && pnpm typecheck
```

Run `pnpm lint && pnpm typecheck && pnpm test` before considering any task done. Do not commit with failing checks.

## 6. Things the agent must never do

- Never bypass the entitlements middleware to "just make it work" for a premium-gated feature — fix the plan/entitlement instead.
- Never write PII (candidate profiles, assessment answers) to logs.
- Never expose a Learner's contact info or assessment answers to a Company before the Learner has opted into the Talent Pool for that specific listing/company.
- Never invent a new role or permission outside the RBAC table in `docs/ARCHITECTURE.md` §Auth without flagging it for review.
- Never add a new payment code path without a corresponding webhook handler and idempotency key.
- Never merge Admin and Learning Provider work as an afterthought — these roles currently have no sitemap/flow; treat any related work as needing product clarification first (see `docs/PRD.md` §Open Gaps).

## 7. Current spec status

This project's product spec is ~60% complete. Known open items live in `docs/PRD.md` §Open Gaps and Decisions Needed. If an agent hits one of those ambiguities while implementing (e.g. "does Verified Skill expire?"), it should stop and surface the question rather than guessing — these decisions affect the data model.

## 8. Language and naming

Product documents mix Indonesian and English (e.g. "Ringkasan Aktivitas", "Rekrut Kandidat"). In code, **always use English identifiers** (variables, DB columns, API fields). Use `next-intl` for any user-facing Indonesian/English copy. Never hardcode Indonesian strings in component logic.
