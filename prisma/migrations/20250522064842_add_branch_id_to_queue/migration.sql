/*
  Warnings:

  - A unique constraint covering the columns `[branch_id,name]` on the table `queues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branch_id` to the `queues` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "queues_name_key";

-- AlterTable
ALTER TABLE "queues" ADD COLUMN     "branch_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "queues_branch_id_name_key" ON "queues"("branch_id", "name");

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
