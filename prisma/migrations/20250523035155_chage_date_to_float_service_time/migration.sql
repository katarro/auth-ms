/*
  Warnings:

  - The `service_time` column on the `ticket_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ticket_history" DROP COLUMN "service_time",
ADD COLUMN     "service_time" DOUBLE PRECISION;
