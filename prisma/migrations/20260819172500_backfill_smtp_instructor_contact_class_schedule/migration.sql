-- Backfills migration history for columns that were applied to the
-- database directly (via `prisma db push`, not tracked) by a concurrent
-- session: settings.smtp_*, instructors.* contact/social fields, and
-- events.class_schedule. All of these already exist in the database —
-- this migration is registered via `prisma migrate resolve --applied`,
-- not run, so it exists purely to bring migration history back in sync
-- with the live schema for a clean `prisma migrate deploy` on a fresh
-- environment.

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "smtp_host" TEXT,
ADD COLUMN     "smtp_password" TEXT,
ADD COLUMN     "smtp_port" INTEGER,
ADD COLUMN     "smtp_user" TEXT;

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "email" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "twitter_url" TEXT,
ADD COLUMN     "linkedin_url" TEXT,
ADD COLUMN     "github_url" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "class_schedule" TEXT;
