-- AlterTable
ALTER TABLE "users" ADD COLUMN     "picture" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
