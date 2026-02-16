"use server";

import prisma from "@prisma/prisma";
import { userBasicSelect } from "@lib/prisma-selects";
import { validateInput } from "@lib/validations/validate";
import { addElectionCommentSchema, toggleReactionSchema } from "@lib/validations/schemas";

export async function getCandidates() {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: candidates };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return { success: false, error: "Failed to fetch candidates" };
  }
}

export async function getCandidate(id) {
  if (!id) return { success: false, error: "Invalid input" };
  try {
    const candidateId = id;

    const candidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                picture: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found" };
    }

    const reactionCounts = candidate.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        ...candidate,
        reactionCounts,
      },
    };
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return { success: false, error: "Failed to fetch candidate" };
  }
}

export async function addComment(candidateId, content, userId) {
  const validation = validateInput(addElectionCommentSchema, { candidateId, content, userId });
  if (!validation.success) return { success: false, error: "Invalid input" };
  try {
    const comment = await prisma.electionComment.create({
      data: {
        content,
        userId,
        candidateId: candidateId,
      },
      include: {
        user: {
          select: userBasicSelect,
        },
      },
    });

    return { success: true, data: comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function toggleReaction(candidateId, type, userId) {
  const validation = validateInput(toggleReactionSchema, { candidateId, type, userId });
  if (!validation.success) return { success: false, error: "Invalid input" };
  try {
    const parsedCandidateId = Number.parseInt(candidateId);

    const existingReaction = await prisma.electionReaction.findUnique({
      where: {
        userId_candidateId_type: {
          userId,
          candidateId: parsedCandidateId,
          type,
        },
      },
    });

    if (existingReaction) {
      await prisma.electionReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      return { success: true, data: { action: "removed" } };
    } else {
      const reaction = await prisma.electionReaction.create({
        data: {
          type,
          userId,
          candidateId: parsedCandidateId,
        },
      });
      return { success: true, data: { action: "added", reaction } };
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    return { success: false, error: "Failed to handle reaction" };
  }
}

export async function createCandidate(candidateData, userId) {
  if (!candidateData || !userId) return { success: false, error: "Invalid input" };
  try {
    const candidate = await prisma.candidate.create({
      data: {
        ...candidateData,
        userId,
        approved: true, // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: candidate };
  } catch (error) {
    console.error("Error creating candidate:", error);
    return { success: false, error: "Failed to create candidate" };
  }
}

export async function getCandidateForEdit(id, userId) {
  if (!id || !userId) return { success: false, error: "Invalid input" };
  try {
    const candidateId = id;

    const candidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
        userId: userId, // Only allow editing by the user who created it
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!candidate) {
      return { success: false, error: "Candidate not found or unauthorized" };
    }

    return { success: true, data: candidate };
  } catch (error) {
    console.error("Error fetching candidate for edit:", error);
    return { success: false, error: "Failed to fetch candidate" };
  }
}

export async function updateCandidate(id, candidateData, userId) {
  if (!id || !candidateData || !userId) return { success: false, error: "Invalid input" };
  try {
    const candidateId = id;

    // First check if the candidate exists and belongs to the user
    const existingCandidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
        userId: userId,
      },
    });

    if (!existingCandidate) {
      return { success: false, error: "Candidate not found or unauthorized" };
    }

    const updatedCandidate = await prisma.candidate.update({
      where: {
        id: candidateId,
      },
      data: {
        ...candidateData,
        // Reset approval status when edited (requires re-approval)
        // approved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: updatedCandidate };
  } catch (error) {
    console.error("Error updating candidate:", error);
    return { success: false, error: "Failed to update candidate" };
  }
}
