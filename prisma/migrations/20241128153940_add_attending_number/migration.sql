/*
  Warnings:

  - Added the required column `current_attending_number` to the `branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "current_attending_number" INTEGER NOT NULL;
