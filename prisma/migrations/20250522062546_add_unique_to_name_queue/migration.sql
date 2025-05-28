/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `queues` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "queues_name_key" ON "queues"("name");
