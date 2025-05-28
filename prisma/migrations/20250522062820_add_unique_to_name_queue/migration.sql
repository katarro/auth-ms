/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `service_modules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "service_modules" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "service_modules_code_key" ON "service_modules"("code");
