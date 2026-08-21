-- CreateEnum
CREATE TYPE "instructor_verification_status" AS ENUM ('UNVERIFIED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "event_delivery_mode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "event_skill_level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "event_status" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "event_status" ADD VALUE 'CHANGES_REQUESTED';
ALTER TYPE "event_status" ADD VALUE 'APPROVED';
ALTER TYPE "event_status" ADD VALUE 'REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'EVENT_SUBMITTED';
ALTER TYPE "notification_type" ADD VALUE 'EVENT_APPROVED';
ALTER TYPE "notification_type" ADD VALUE 'EVENT_CHANGES_REQUESTED';
ALTER TYPE "notification_type" ADD VALUE 'EVENT_REJECTED';
ALTER TYPE "notification_type" ADD VALUE 'EVENT_PUBLISHED_TO_INSTRUCTOR';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "change_request_note" TEXT,
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "delivery_mode" "event_delivery_mode" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "promo_video_url" TEXT,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "skill_level" "event_skill_level" NOT NULL DEFAULT 'ALL_LEVELS',
ADD COLUMN     "submitted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_status" "instructor_verification_status" NOT NULL DEFAULT 'UNVERIFIED';

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "max_session_duration_minutes" INTEGER NOT NULL DEFAULT 480,
ADD COLUMN     "min_session_duration_minutes" INTEGER NOT NULL DEFAULT 15;

-- CreateTable
CREATE TABLE "instructor_categories" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "instructor_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructor_categories_instructor_id_category_id_key" ON "instructor_categories"("instructor_id", "category_id");

-- AddForeignKey
ALTER TABLE "instructor_categories" ADD CONSTRAINT "instructor_categories_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_categories" ADD CONSTRAINT "instructor_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

