/*
  Warnings:

  - Added the required column `available` to the `branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branch" ADD COLUMN     "available" BOOLEAN NOT NULL;
