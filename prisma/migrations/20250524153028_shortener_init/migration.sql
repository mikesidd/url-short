/*
  Warnings:

  - You are about to drop the `Redirect` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Redirect";

-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_shortId_key" ON "ShortUrl"("shortId");
