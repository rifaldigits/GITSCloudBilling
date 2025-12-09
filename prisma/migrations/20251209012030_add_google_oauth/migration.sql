/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "googleEmail" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "pictureUrl" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenExpiry" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'ADMIN',
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
