/*
  Warnings:

  - Changed the type of `status` on the `FriendRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropEnum
DROP TYPE "FriendRequestStatus";
