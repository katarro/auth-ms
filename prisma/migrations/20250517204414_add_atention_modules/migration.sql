/*
  Warnings:

  - You are about to drop the column `service_point_id` on the `queue_tickets` table. All the data in the column will be lost.
  - You are about to drop the `service_points` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rut]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rut]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service_type_id` to the `queue_tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_type_id` to the `queues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "queue_tickets" DROP CONSTRAINT "queue_tickets_service_point_id_fkey";

-- DropForeignKey
ALTER TABLE "service_points" DROP CONSTRAINT "service_points_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "service_points" DROP CONSTRAINT "service_points_executive_id_fkey";

-- DropForeignKey
ALTER TABLE "service_points" DROP CONSTRAINT "service_points_queue_id_fkey";

-- AlterTable
ALTER TABLE "queue_tickets" DROP COLUMN "service_point_id",
ADD COLUMN     "service_module_id" TEXT,
ADD COLUMN     "service_type_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "queues" ADD COLUMN     "service_type_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "service_points";

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_modules" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "current_executive_id" TEXT,
    "queue_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_assignments" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "executive_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_types_branch_id_idx" ON "service_types"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_branch_id_name_key" ON "service_types"("branch_id", "name");

-- CreateIndex
CREATE INDEX "service_modules_branch_id_idx" ON "service_modules"("branch_id");

-- CreateIndex
CREATE INDEX "service_modules_service_type_id_idx" ON "service_modules"("service_type_id");

-- CreateIndex
CREATE INDEX "service_modules_current_executive_id_idx" ON "service_modules"("current_executive_id");

-- CreateIndex
CREATE INDEX "service_modules_queue_id_idx" ON "service_modules"("queue_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_modules_branch_id_name_key" ON "service_modules"("branch_id", "name");

-- CreateIndex
CREATE INDEX "module_assignments_module_id_idx" ON "module_assignments"("module_id");

-- CreateIndex
CREATE INDEX "module_assignments_executive_id_idx" ON "module_assignments"("executive_id");

-- CreateIndex
CREATE INDEX "module_assignments_module_id_executive_id_start_time_idx" ON "module_assignments"("module_id", "executive_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "companies_rut_key" ON "companies"("rut");

-- CreateIndex
CREATE INDEX "queue_tickets_service_type_id_idx" ON "queue_tickets"("service_type_id");

-- CreateIndex
CREATE INDEX "queue_tickets_service_module_id_idx" ON "queue_tickets"("service_module_id");

-- CreateIndex
CREATE INDEX "queues_service_type_id_idx" ON "queues"("service_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_rut_key" ON "users"("rut");

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_current_executive_id_fkey" FOREIGN KEY ("current_executive_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_modules" ADD CONSTRAINT "service_modules_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_assignments" ADD CONSTRAINT "module_assignments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "service_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_assignments" ADD CONSTRAINT "module_assignments_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_service_module_id_fkey" FOREIGN KEY ("service_module_id") REFERENCES "service_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
