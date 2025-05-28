/*
  Warnings:

  - You are about to drop the column `branchId` on the `queues` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_branchId_fkey";

-- AlterTable
ALTER TABLE "queues" DROP COLUMN "branchId";
