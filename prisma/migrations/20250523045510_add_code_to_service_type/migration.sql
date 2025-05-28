/*
  Warnings:

  - You are about to drop the column `code` on the `service_modules` table. All the data in the column will be lost.
  - You are about to drop the column `service_time` on the `ticket_history` table. All the data in the column will be lost.
  - You are about to drop the column `wait_time` on the `ticket_history` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `service_types` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `module_code` to the `queue_tickets` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `ticket_number` on the `queue_tickets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `service_types` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `service_types` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "service_modules_code_key";

-- AlterTable
ALTER TABLE "queue_tickets" ADD COLUMN     "module_code" TEXT NOT NULL,
DROP COLUMN "ticket_number",
ADD COLUMN     "ticket_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "service_modules" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "service_types" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "ticket_history" DROP COLUMN "service_time",
DROP COLUMN "wait_time",
ADD COLUMN     "service_time_minutes" DOUBLE PRECISION,
ADD COLUMN     "wait_time_minutes" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "service_types_code_key" ON "service_types"("code");
