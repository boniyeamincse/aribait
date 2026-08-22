-- CreateEnum
CREATE TYPE "instructor_earning_status" AS ENUM ('PENDING', 'AVAILABLE', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "instructor_payout_method" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_BANKING', 'BKASH', 'NAGAD', 'ROCKET', 'OTHER');

-- CreateEnum
CREATE TYPE "instructor_payment_status" AS ENUM ('RECORDED', 'REVERSED');

-- AlterEnum
ALTER TYPE "notification_type" ADD VALUE 'INSTRUCTOR_PAYMENT_RECORDED';

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "instructor_commission_pct" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "instructor_earnings" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "gross_amount_bdt" INTEGER NOT NULL,
    "instructor_pct" INTEGER NOT NULL,
    "instructor_amount_bdt" INTEGER NOT NULL,
    "platform_amount_bdt" INTEGER NOT NULL,
    "status" "instructor_earning_status" NOT NULL DEFAULT 'PENDING',
    "available_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_payments" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "amount_bdt" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "method" "instructor_payout_method" NOT NULL,
    "reference_number" TEXT NOT NULL,
    "note" TEXT,
    "recorded_by_id" TEXT NOT NULL,
    "status" "instructor_payment_status" NOT NULL DEFAULT 'RECORDED',
    "reversed_by_id" TEXT,
    "reversed_at" TIMESTAMP(3),
    "reverse_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instructor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instructor_earnings_registration_id_key" ON "instructor_earnings"("registration_id");

-- CreateIndex
CREATE INDEX "instructor_earnings_instructor_id_status_idx" ON "instructor_earnings"("instructor_id", "status");

-- CreateIndex
CREATE INDEX "instructor_payments_instructor_id_status_idx" ON "instructor_payments"("instructor_id", "status");

-- AddForeignKey
ALTER TABLE "instructor_earnings" ADD CONSTRAINT "instructor_earnings_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_earnings" ADD CONSTRAINT "instructor_earnings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_earnings" ADD CONSTRAINT "instructor_earnings_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_payments" ADD CONSTRAINT "instructor_payments_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_payments" ADD CONSTRAINT "instructor_payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_payments" ADD CONSTRAINT "instructor_payments_reversed_by_id_fkey" FOREIGN KEY ("reversed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

