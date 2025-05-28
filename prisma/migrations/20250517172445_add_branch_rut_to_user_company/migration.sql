/*
  Warnings:

  - Added the required column `address` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;
