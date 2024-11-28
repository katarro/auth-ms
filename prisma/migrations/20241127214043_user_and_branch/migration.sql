/*
  Warnings:

  - You are about to drop the `number_registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `queue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "number_registration" DROP CONSTRAINT "number_registration_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "number_registration" DROP CONSTRAINT "number_registration_user_id_fkey";

-- DropForeignKey
ALTER TABLE "queue" DROP CONSTRAINT "queue_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "queue" DROP CONSTRAINT "queue_user_id_fkey";

-- DropTable
DROP TABLE "number_registration";

-- DropTable
DROP TABLE "queue";
