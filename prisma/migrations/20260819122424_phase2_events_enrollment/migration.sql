-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('LIVE_CLASS', 'TRAINING_PROGRAM', 'WORKSHOP', 'SEMINAR');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "session_platform" AS ENUM ('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('SCHEDULED', 'JOIN_OPEN', 'LIVE', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "registration_status" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'COMPLETED');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "event_type" NOT NULL,
    "category_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "banner_url" TEXT,
    "learning_objectives" TEXT,
    "target_audience" TEXT,
    "prerequisites" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "capacity" INTEGER,
    "price_bdt" INTEGER NOT NULL DEFAULT 0,
    "registration_opens_at" TIMESTAMP(3),
    "registration_closes_at" TIMESTAMP(3),
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "terms_and_refund_policy" TEXT,
    "status" "event_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "description" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "time_zone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "host_instructor_id" TEXT,
    "platform" "session_platform" NOT NULL,
    "meeting_id" TEXT,
    "meeting_url" TEXT,
    "meeting_passcode" TEXT,
    "status" "session_status" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "status" "registration_status" NOT NULL DEFAULT 'CONFIRMED',
    "price_snapshot_bdt" INTEGER NOT NULL,
    "discount_amount_snapshot_bdt" INTEGER NOT NULL DEFAULT 0,
    "coupon_code_snapshot" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_slug_key" ON "instructors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "events"("category_id");

-- CreateIndex
CREATE INDEX "events_instructor_id_idx" ON "events"("instructor_id");

-- CreateIndex
CREATE INDEX "event_sessions_event_id_idx" ON "event_sessions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_sessions_event_id_sequence_key" ON "event_sessions"("event_id", "sequence");

-- CreateIndex
CREATE INDEX "registrations_event_id_status_idx" ON "registrations"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_user_id_event_id_key" ON "registrations"("user_id", "event_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_host_instructor_id_fkey" FOREIGN KEY ("host_instructor_id") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
