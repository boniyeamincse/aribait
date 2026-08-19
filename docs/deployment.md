# Ariba IT — Deployment

**Document type:** Deployment and operations reference
**Related document:** [idea.md](./idea.md), [architecture.md](./architecture.md), [security.md](./security.md)

---

## 1. Hosting Overview

| Component | Provider |
|---|---|
| Application hosting | Vercel |
| Database | Neon PostgreSQL (managed, serverless) |
| File storage | S3-compatible object storage |
| Email | Transactional email provider |
| Scheduled jobs | Vercel Cron → `app/api/cron/*` |
| Monitoring | Error and performance monitoring service |

## 2. Deployment Flow

```text
GitHub Repository
       ↓
Vercel Preview Deployment
       ↓
Automated checks
       ↓
Production Deployment
       ↓
Neon Production Database
```

- Every push/PR gets a Vercel Preview Deployment against a preview/branch database (or Neon branch) — never against production data.
- Automated checks (type-check, lint, tests, Prisma migration validation) gate promotion to production.
- Production deploys run Prisma migrations as part of the release step, not manually against the live database out-of-band.

## 3. Environments

Three distinct environments, each with its own credentials and secrets:

- **Development** — local machine, local `.env`, dev/test database (or a Neon dev branch).
- **Preview** — per-PR Vercel deployment, isolated database branch where possible.
- **Production** — live Neon database, production secrets, production payment/email/storage credentials.

Neon's branching model is well suited here: a preview deployment can run against a throwaway database branch created from production schema without touching production data.

## 4. Environment Variables

See [security.md](./security.md) §9 for the full variable list and handling rules. Summary of required groups:

- Database: `DATABASE_URL`, `DIRECT_DATABASE_URL`
- Auth: `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- Payments: `PAYMENT_PROVIDER`, `PAYMENT_API_KEY`, `PAYMENT_SECRET`, `PAYMENT_WEBHOOK_SECRET`
- Email: `EMAIL_API_KEY`, `EMAIL_FROM`
- Meeting platform: `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`
- Storage: `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`
- Cron: `CRON_SECRET`

## 5. Scheduled Jobs (Vercel Cron)

| Job | Frequency | Purpose |
|---|---|---|
| `session-reminders` | Every 5 minutes | Finds Sessions starting in the reminder window, notifies confirmed eligible students (in-app + email), records sent/failed status. See `idea.md` §5.10. |
| `expire-seat-holds` | Every 1–5 minutes (match hold granularity) | Releases expired `seat_holds` back to `AVAILABLE`. |
| `session-status-sync` | Every 1–5 minutes | Advances `event_sessions.status` through `SCHEDULED → JOIN_OPEN → LIVE → COMPLETED` per configured join window. |

All cron routes require the `CRON_SECRET` header/token and reject unauthenticated calls.

## 6. Database Migrations

- `prisma/schema.prisma` is the single source of truth; migrations live in `prisma/migrations/`.
- Migrations run as part of the deployment pipeline (build/release step), not manually.
- Destructive migrations (column drops, type narrowing) require a reviewed plan given the financial-history constraints in [database.md](./database.md) §4.
- Production migrations should be tested against a Neon branch seeded from a production-like dataset before promotion.

## 7. Release Checklist

1. Automated checks pass on the PR (type-check, lint, tests).
2. Preview deployment smoke-tested against its own database branch.
3. Migration reviewed for backward compatibility with the currently running production code (avoid breaking changes mid-deploy).
4. Environment variables confirmed present for any newly introduced integration.
5. Promote to production; confirm cron jobs still fire post-deploy (reminder job in particular — a silent failure here directly affects students).
6. Monitor error/performance dashboard immediately after release.

## 8. Rollback

- Vercel supports instant rollback to a prior deployment for application code.
- Database rollback is **not** automatic — migrations should be additive/backward-compatible where possible so an application rollback doesn't require a corresponding schema rollback.
- Any manual data correction (e.g., mis-fired payment webhook) must go through an auditable admin action, not a direct database edit, so it lands in `audit_logs`.

## 9. Observability

- Error and performance monitoring service wired into both the Next.js app and cron routes.
- Health checks configured for the production deployment.
- Alerting on: payment webhook failures, cron job failures (especially `session-reminders`), elevated error rates on auth/payment/join routes.
