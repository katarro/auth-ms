-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Client', 'Executive', 'Admin');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Pending', 'Attend', 'Canceled');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "available" BOOLEAN NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue" (
    "id" SERIAL NOT NULL,
    "previous_number" INTEGER NOT NULL,
    "current_number" INTEGER NOT NULL,
    "next_number" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,

    CONSTRAINT "queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_registration" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branch_id_key" ON "branch"("id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_address_key" ON "branch"("address");

-- CreateIndex
CREATE UNIQUE INDEX "queue_id_key" ON "queue"("id");

-- CreateIndex
CREATE UNIQUE INDEX "number_registration_id_key" ON "number_registration"("id");

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_registration" ADD CONSTRAINT "number_registration_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_registration" ADD CONSTRAINT "number_registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
