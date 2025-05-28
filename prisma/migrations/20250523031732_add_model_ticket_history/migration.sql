-- CreateTable
CREATE TABLE "ticket_history" (
    "id" TEXT NOT NULL,
    "original_id" TEXT NOT NULL,
    "user_id" TEXT,
    "service_module_id" TEXT,
    "queue_id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "entry_time" TIMESTAMP(3) NOT NULL,
    "call_time" TIMESTAMP(3),
    "service_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "priority_level" INTEGER NOT NULL,
    "estimated_wait_time" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_history_original_id_idx" ON "ticket_history"("original_id");

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_service_module_id_fkey" FOREIGN KEY ("service_module_id") REFERENCES "service_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
