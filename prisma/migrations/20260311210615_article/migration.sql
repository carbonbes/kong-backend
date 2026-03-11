-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT';
