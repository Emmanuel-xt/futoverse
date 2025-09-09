/*
  Warnings:

  - The primary key for the `Candidate` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ElectionComment" DROP CONSTRAINT "ElectionComment_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "ElectionReaction" DROP CONSTRAINT "ElectionReaction_candidateId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Candidate_id_seq";

-- AlterTable
ALTER TABLE "ElectionComment" ALTER COLUMN "candidateId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ElectionReaction" ALTER COLUMN "candidateId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "ElectionComment" ADD CONSTRAINT "ElectionComment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionReaction" ADD CONSTRAINT "ElectionReaction_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
