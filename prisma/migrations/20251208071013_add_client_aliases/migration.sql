-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];
