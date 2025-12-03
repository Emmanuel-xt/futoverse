-- CreateEnum
CREATE TYPE "EmbedPlatform" AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "EmbeddedReel" (
    "id" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "platform" "EmbedPlatform" NOT NULL,
    "thumbnailUrl" TEXT,
    "tiktokEmbedHtml" TEXT,
    "caption" TEXT,
    "hashtags" TEXT[],
    "postedById" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmbeddedReel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddedReelLike" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddedReelLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddedReelComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "parentCommentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddedReelComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddedReelShare" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddedReelShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmbeddedReel_postedById_idx" ON "EmbeddedReel"("postedById");

-- CreateIndex
CREATE INDEX "EmbeddedReel_platform_idx" ON "EmbeddedReel"("platform");

-- CreateIndex
CREATE INDEX "EmbeddedReel_createdAt_idx" ON "EmbeddedReel"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "EmbeddedReelLike_reelId_idx" ON "EmbeddedReelLike"("reelId");

-- CreateIndex
CREATE INDEX "EmbeddedReelLike_userId_idx" ON "EmbeddedReelLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddedReelLike_reelId_userId_key" ON "EmbeddedReelLike"("reelId", "userId");

-- CreateIndex
CREATE INDEX "EmbeddedReelComment_reelId_idx" ON "EmbeddedReelComment"("reelId");

-- CreateIndex
CREATE INDEX "EmbeddedReelComment_userId_idx" ON "EmbeddedReelComment"("userId");

-- CreateIndex
CREATE INDEX "EmbeddedReelComment_parentCommentId_idx" ON "EmbeddedReelComment"("parentCommentId");

-- CreateIndex
CREATE INDEX "EmbeddedReelShare_reelId_idx" ON "EmbeddedReelShare"("reelId");

-- CreateIndex
CREATE INDEX "EmbeddedReelShare_userId_idx" ON "EmbeddedReelShare"("userId");

-- AddForeignKey
ALTER TABLE "EmbeddedReel" ADD CONSTRAINT "EmbeddedReel_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelLike" ADD CONSTRAINT "EmbeddedReelLike_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "EmbeddedReel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelLike" ADD CONSTRAINT "EmbeddedReelLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelComment" ADD CONSTRAINT "EmbeddedReelComment_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "EmbeddedReel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelComment" ADD CONSTRAINT "EmbeddedReelComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelComment" ADD CONSTRAINT "EmbeddedReelComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "EmbeddedReelComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelShare" ADD CONSTRAINT "EmbeddedReelShare_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "EmbeddedReel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddedReelShare" ADD CONSTRAINT "EmbeddedReelShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
