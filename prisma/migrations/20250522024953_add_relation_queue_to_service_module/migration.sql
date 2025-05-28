/*
  Warnings:

  - You are about to drop the column `branch_id` on the `queues` table. All the data in the column will be lost.
  - You are about to drop the column `queue_id` on the `service_modules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[service_module_id]` on the table `queues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service_module_id` to the `queues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "service_modules" DROP CONSTRAINT "service_modules_queue_id_fkey";

-- DropIndex
DROP INDEX "queues_branch_id_idx";

-- DropIndex
DROP INDEX "queues_branch_id_name_key";

-- DropIndex
DROP INDEX "service_modules_queue_id_idx";

-- AlterTable
ALTER TABLE "queues" DROP COLUMN "branch_id",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "service_module_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "service_modules" DROP COLUMN "queue_id",
ADD COLUMN     "queueId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "queues_service_module_id_key" ON "queues"("service_module_id");

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_service_module_id_fkey" FOREIGN KEY ("service_module_id") REFERENCES "service_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
