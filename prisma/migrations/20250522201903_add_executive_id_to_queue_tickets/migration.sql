-- AlterTable
ALTER TABLE "queue_tickets" ADD COLUMN     "executive_id" TEXT;

-- CreateIndex
CREATE INDEX "queue_tickets_executive_id_idx" ON "queue_tickets"("executive_id");

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
