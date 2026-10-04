# Waylo

Two-sided career and talent marketplace. See `docs/PRD.md`, `docs/TRD.md`, `docs/ARCHITECTURE.md`, `docs/RULE.md`, and `DESIGN.md`.

## Structure

```
waylo-fe/            Next.js 16 frontend (App Router, Tailwind v4, next-intl)
waylo-be/            Express 5 API + Prisma + PostgreSQL
packages/shared/     @waylo/shared: zod schemas & shared types (single source of truth)
docker-compose.yml   Postgres (host 5433) + Redis (host 6380)
DESIGN.md            Design direction and tokens
```

## Local setup

```bash
# 1. Infra
docker compose up -d

# 2. Dependencies (npm workspaces; install per package)
npm install --prefix packages/shared
npm install --prefix waylo-be
npm install --prefix waylo-fe

# 3. Database
cp waylo-be/.env.example waylo-be/.env
npm run prisma:generate --prefix waylo-be
npm run prisma:migrate --prefix waylo-be
npm run prisma:seed --prefix waylo-be

# 4. Run
npm run dev --prefix waylo-be   # API   -> http://localhost:4000
npm run dev --prefix waylo-fe   # Web   -> http://localhost:3000
```

## Demo accounts (from the seed)

| Role | Email | Password |
|---|---|---|
| Learner | `kalandra@waylo.test` | `Password123` |
| Company HRD | `hrd@nusadigital.test` | `Password123` |

All figures shown in the UI come from the seed dataset. They are demo data, not production statistics. See `DESIGN.md` for the content-honesty rules.

## Checks

```bash
npm test --prefix waylo-be       # unit tests (state machine)
npm run typecheck --prefix waylo-be
npm run lint --prefix waylo-fe
npm run build --prefix waylo-fe
```
