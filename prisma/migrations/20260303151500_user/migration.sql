/*
  Warnings:

  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150);
