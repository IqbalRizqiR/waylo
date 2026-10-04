# Waylo — Engineering Rules

Status: Draft v1.1. These rules are binding for all contributors, human and AI. Changes to this file require review, not a unilateral edit mid-task.

## 0. Workspace and commands (v1.1)

The repo uses **npm workspaces**, not pnpm (pnpm is not installed in this environment). Folders keep their names:

- `waylo-fe` — Next.js 16 frontend (App Router, Tailwind v4, next-intl).
- `waylo-be` — Express 5 API (modular monolith) + Prisma + PostgreSQL.
- `packages/shared` — `@waylo/shared`, the single source of truth for zod schemas and shared types.
- Root `docker-compose.yml` — Postgres (host port 5433) and Redis (host port 6380).

Commands (replaces the pnpm examples previously in section 5):

```bash
npm install --prefix waylo-fe
npm install --prefix waylo-be
npm install --prefix packages/shared

npm run dev --prefix waylo-fe          # frontend on :3000
npm run dev --prefix waylo-be          # API on :4000
npm run prisma:migrate --prefix waylo-be
npm run prisma:seed --prefix waylo-be
npm test --prefix waylo-be             # vitest
npm run lint --prefix waylo-fe
```

`@waylo/shared` is consumed as TypeScript source. Next resolves it through `transpilePackages` plus `turbopack.root` (pointing at the monorepo parent, so the linked package outside the app root resolves). The API resolves it through its tsconfig `paths` alias and the vitest `resolve.alias`.

## 1. Naming conventions

- **Files:** kebab-case (`skill-gap.service.ts`, `create-job.tsx`).
- **Variables/functions:** camelCase. **Types/interfaces/classes:** PascalCase. **Constants:** UPPER_SNAKE_CASE only for true constants (enums prefer PascalCase members).
- **Database:** snake_case table and column names via Prisma `@map`; Prisma model names stay PascalCase.
- **API routes:** kebab-case, plural nouns, versionless for v1 (`/jobs`, `/talent-pool`, `/mentor-program-invites`).
- **English only in code.** Product docs mix Indonesian/English; identifiers, comments, and log messages must be English. User-facing copy goes through `next-intl`, never hardcoded.
- **Booleans** read as a question (`isVerified`, `hasOptedIn`), not `verified_flag` or `flag1`.
- **Status enums** are explicit strings (`"pending" | "accepted" | "declined"`), never bare integers, so logs and DB rows stay human-readable.

## 2. Git workflow

- **Branches:** `feature/<module>-<short-desc>`, `fix/<module>-<short-desc>`, `chore/<short-desc>`. No work directly on `main`.
- **Commits:** Conventional Commits — `feat(skills): add skill-gap calculation service`, `fix(billing): handle duplicate webhook events`, `docs: update PRD open gaps`.
- **PRs:** one module/concern per PR where possible. PR description must state: what changed, why, how it was tested, and which doc (PRD/TRD/ARCHITECTURE) it implements or deviates from.
- **Review:** at least one approval required before merge. A PR touching the skills graph, application state machine, or billing webhooks requires review from someone other than the author, even on a small team — these are the modules where a silent bug is most expensive.
- **No merging with failing CI.** Lint, typecheck, and tests must be green.

## 3. Code structure rules

- Backend: controller → service → repository, strictly in that direction. Controllers do not touch Prisma directly. Services do not know about HTTP (no `req`/`res` in a service file).
- One module's repository is never imported from another module. Cross-module calls go through the other module's service; cross-module side effects go through a domain event, not a deep call chain (see `docs/ARCHITECTURE.md` §2).
- Shared request/response shapes are defined once, in `packages/shared`, as zod schemas, and imported by both `apps/api` (validation) and `apps/web` (form validation + type inference). Never redefine the same shape twice.
- No business logic in React components beyond simple derived UI state. Anything involving the skill graph, entitlements, or pipeline transitions belongs in a service function that can be unit tested without rendering a component.

## 4. API design rules

- REST-ish, resource-oriented. Use the right verb: `GET` (read, no side effects), `POST` (create/action), `PATCH` (partial update), `DELETE` (soft-delete unless truly transient data).
- Every mutating endpoint validates its body/query against a zod schema from `packages/shared` before touching the database.
- Every response follows a consistent envelope: `{ data, error: null }` on success, `{ data: null, error: { code, message } }` on failure. Never leak stack traces or raw Prisma errors to the client.
- Pagination is cursor-based for any list endpoint that can grow unbounded (Talent Pool, Course list, Application list).
- State-machine transitions are their own endpoint (`POST /applications/:id/advance`), not a generic `PATCH` on the status field — this is where transition validation and history logging live.
- Role and plan checks happen in middleware, before the controller body runs, never as an `if` buried inside business logic.

## 5. Database rules

- All schema changes go through Prisma migrations, committed to the repo, never applied by hand against a running database.
- Soft-delete (`deletedAt: DateTime?`) for any entity that historical records may reference (Course, Job, Assessment, Certificate). Hard-delete only for genuinely transient data (e.g. expired refresh tokens).
- Every `verified` or `status` field is backed by a `source`/history record, not a bare flag with no audit trail (see `docs/ARCHITECTURE.md` §5–6).
- No PII in analytics/read-model tables beyond what's strictly needed for the aggregation; prefer joining to the source-of-truth table at query time over duplicating PII into a denormalized table.

## 6. Testing rules

- Unit tests required for: skill-gap calculation, all state-machine transition functions (Application, Course, MentorProgramInvite, Subscription), entitlement middleware logic.
- Integration tests required for: auth (login/register/refresh/role guard), the full Application pipeline (both Free and Premium sub-paths), payment webhook handling (including duplicate-event idempotency).
- No PR that touches a state machine merges without a test asserting the illegal transitions are rejected, not just the happy path.
- Test data uses factories/seed helpers in `packages/db/prisma/seed`, not ad hoc inline fixtures duplicated across test files.

## 7. Security & privacy rules

- Never log PII (names, emails, assessment answers, phone numbers) in plaintext logs. Redact or reference by ID.
- A Company can never query or receive a Learner's data unless that Learner has opted into the Talent Pool (or has actively applied to that Company's job). Enforce this in the `talent-pool` and `applications` services, not only in the frontend.
- Rate-limit auth endpoints and assessment-submission endpoints.
- Secrets (DB credentials, JWT signing keys, payment gateway keys) live in environment variables or a secrets manager, never committed, never logged.
- Every payment webhook handler verifies the provider's signature before processing and is idempotent per event ID.

## 8. Documentation rules

- Any change that alters scope, a state machine, or the data model must update the relevant doc (`PRD.md`, `ARCHITECTURE.md`, or `TRD.md`) in the same PR — docs and code must not drift.
- Open product questions (see `PRD.md` §10–11) block the related engineering work; do not silently assume an answer and build around it. Surface the ambiguity in the PR description or an issue instead.

## 9. Language & content rules

- All new UI copy is added as translation keys (`next-intl`) in both `id` and `en` locale files, even if only one is filled in at first — never a hardcoded string in a component.
- Code comments, commit messages, and variable names are English regardless of which locale the feature is for.
