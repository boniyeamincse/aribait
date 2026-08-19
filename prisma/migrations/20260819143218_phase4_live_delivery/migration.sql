-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('SESSION_REMINDER', 'SESSION_RESCHEDULED', 'SESSION_CANCELLED', 'EVENT_CANCELLED', 'EVENT_COMPLETED', 'WAITLIST_PROMOTED', 'ANNOUNCEMENT', 'REGISTRATION_CONFIRMED', 'PAYMENT_CONFIRMED', 'PAYMENT_FAILED');

-- CreateTable
CREATE TABLE "session_attendance" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "event_session_id" TEXT NOT NULL,
    "status" "attendance_status",
    "joined_at" TIMESTAMP(3),
    "marked_by_id" TEXT,
    "marked_at" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "event_id" TEXT,
    "event_session_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_attendance_event_session_id_idx" ON "session_attendance"("event_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_attendance_registration_id_event_session_id_key" ON "session_attendance"("registration_id", "event_session_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_event_session_id_type_idx" ON "notifications"("event_session_id", "type");

-- AddForeignKey
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_event_session_id_fkey" FOREIGN KEY ("event_session_id") REFERENCES "event_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_session_id_fkey" FOREIGN KEY ("event_session_id") REFERENCES "event_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
