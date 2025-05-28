-- AlterTable
ALTER TABLE "queue_tickets_absent" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'WAITING';
