/*
  Warnings:

  - You are about to drop the column `queueId` on the `service_modules` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "service_modules" DROP CONSTRAINT "service_modules_queueId_fkey";

-- AlterTable
ALTER TABLE "service_modules" DROP COLUMN "queueId",
ADD COLUMN     "queue_id" TEXT;

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
