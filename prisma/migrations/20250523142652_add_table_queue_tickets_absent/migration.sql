/*
  Warnings:

  - Changed the type of `ticket_number` on the `ticket_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ticket_history" DROP COLUMN "ticket_number",
ADD COLUMN     "ticket_number" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "queue_tickets_absent" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "user_id" TEXT,
    "service_module_id" TEXT,
    "executive_id" TEXT,
    "ticket_number" INTEGER NOT NULL,
    "module_code" TEXT NOT NULL DEFAULT 'R',
    "anonymous_email" TEXT,
    "anonymous_phone" TEXT,
    "registration_token" TEXT,
    "estimated_wait_time" INTEGER NOT NULL,
    "priority_level" INTEGER NOT NULL DEFAULT 0,
    "entryType" "EntryType" NOT NULL DEFAULT 'VIRTUAL',
    "absence_time" TIMESTAMP(3) NOT NULL,
    "attempts_count" INTEGER NOT NULL DEFAULT 1,
    "original_entry_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_tickets_absent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queue_tickets_absent_queue_id_idx" ON "queue_tickets_absent"("queue_id");

-- CreateIndex
CREATE INDEX "queue_tickets_absent_ticket_number_idx" ON "queue_tickets_absent"("ticket_number");

-- AddForeignKey
ALTER TABLE "queue_tickets_absent" ADD CONSTRAINT "queue_tickets_absent_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets_absent" ADD CONSTRAINT "queue_tickets_absent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets_absent" ADD CONSTRAINT "queue_tickets_absent_service_module_id_fkey" FOREIGN KEY ("service_module_id") REFERENCES "service_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets_absent" ADD CONSTRAINT "queue_tickets_absent_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
