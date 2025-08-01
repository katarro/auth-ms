-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "ticket_history" ADD COLUMN     "executive_id" TEXT;

-- CreateIndex
CREATE INDEX "ticket_history_executive_id_idx" ON "ticket_history"("executive_id");

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
