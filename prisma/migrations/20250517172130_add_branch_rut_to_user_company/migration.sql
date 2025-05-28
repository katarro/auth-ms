/*
  Warnings:

  - Added the required column `rut` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "rut" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rut" TEXT;
