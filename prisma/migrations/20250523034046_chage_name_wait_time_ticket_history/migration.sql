/*
  Warnings:

  - You are about to drop the column `estimated_wait_time` on the `ticket_history` table. All the data in the column will be lost.
  - Added the required column `wait_time` to the `ticket_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_history" DROP COLUMN "estimated_wait_time",
ADD COLUMN     "wait_time" INTEGER NOT NULL;
