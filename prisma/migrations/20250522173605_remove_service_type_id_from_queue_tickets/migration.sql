/*
  Warnings:

  - You are about to drop the column `service_type_id` on the `queue_tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "queue_tickets" DROP CONSTRAINT "queue_tickets_service_type_id_fkey";

-- DropIndex
DROP INDEX "queue_tickets_service_type_id_idx";

-- AlterTable
ALTER TABLE "queue_tickets" DROP COLUMN "service_type_id";
