"use server";

import prisma from "@prisma/prisma";
import { SYSTEM_USER_ID } from "@constants/app-config";
import { userBasicSelect } from "@lib/prisma-selects";
import { validateInput } from "@lib/validations/validate";
import { findConversationSchema, createGroupSchema, searchQuerySchema } from "@lib/validations/schemas";

// Fetch conversations where the authenticated user is a participant
export const getUsersForSidebar = async (authUserId) => {
  if (!authUserId) return [];
  const conversations = await prisma.conversation.findMany({
    where: {
      participantIds: {
        has: authUserId,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      updatedAt: true,
      isGroup: true,
      name: true,
      description: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          body: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      },
      participantIds: true,
    },
  });

  let usersForSidebar = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = conversation.messages[0] || null;

      if (conversation.isGroup) {
        // Handle group conversation
        return {
          id: `group-${conversation.id}`, // Important to avoid collision
          name: conversation.name,
          description: conversation.description,
          picture: "/images/group-avatar.png", // or a dynamic image
          isGroup: true,
          lastMessage,
          conversationId: conversation.id,
        };
      } else {
        // Handle 1-on-1 conversation
        const receiverId = conversation.participantIds.find(
          (id) => id !== authUserId
        );
        if (!receiverId) return null;

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: userBasicSelect,
        });

        return receiver
          ? {
              ...receiver,
              lastMessage,
              isGroup: false,
              conversationId: conversation.id,
            }
          : null;
      }
    })
  );

  usersForSidebar = usersForSidebar.filter(Boolean);
  usersForSidebar.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || 0;
    const bTime = b.lastMessage?.createdAt || 0;
    return bTime - aTime;
  });

  return usersForSidebar;
};

export const getSearchedUsersForConversation = async (search) => {
  const v = validateInput(searchQuerySchema, { query: search });
  if (!v.success) return [];
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      },
      select: userBasicSelect,
      take: 10,
    });

    return users;
  } catch (error) {
    console.error("Error fetching searched users:", error);
    return [];
  }
};

export const findOrCreateConversation = async (currentUserId, receiverId) => {
  if (!currentUserId || !receiverId) return null;
  const v = validateInput(findConversationSchema, { currentUserId, receiverId });
  if (!v.success) return null;
  try {
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [currentUserId, receiverId],
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [currentUserId, receiverId],
          },
        },
      });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: userBasicSelect,
    });

    return { conversation, receiver };
  } catch (error) {
    console.error("Error finding or creating conversation:", error);
    return null;
  }
};

// Alias for backward compatibility — both callers use the same logic
export const getConversationByUserId = findOrCreateConversation;

// Fetches user data for DM
export const getUserForConversation = async (id) => {
  if (!id) return null;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      select: userBasicSelect,
    });
    return user;
  } catch (error) {
    console.error("Error in getUserForConversation:", error);
    return null;
  }
};

export const createGroupChat = async (form) => {
  const v = validateInput(createGroupSchema, form);
  if (!v.success) return false;
  try {
    const { name, description, participants, creator, creatorName } = form;

    if (!name || !participants || participants.length < 1) return;

    // Add current user to group automatically
    const allParticipantIds = [...new Set([...participants, creator])];

    const newGroup = await prisma.conversation.create({
      data: {
        isGroup: true,
        name,
        description,
        participantIds: {
          set: allParticipantIds,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        participantIds: true,
        updatedAt: true,
        createdAt: true,
        isGroup: true,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: newGroup.id,
        senderId: SYSTEM_USER_ID,
        body: `${creatorName} created ${name} `,
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating group:", error);
    return false;
  }
};

export const fetchAllGroups = async () => {
  try {
    const groups = await prisma.conversation.findMany({
      where: {
        isGroup: true,
      },
    });
    return groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const syncConversationMembers = async () => {
  try {
    const conversations = await prisma.conversation.findMany({
      select: {
        id: true,
        participantIds: true,
      },
    });

    for (const conversation of conversations) {
      const { id: conversationId, participantIds } = conversation;

      for (const userId of participantIds) {
        try {
          // Upsert to avoid duplicates (insert if not exist)
          await prisma.conversationMember.upsert({
            where: {
              userId_conversationId: {
                userId,
                conversationId,
              },
            },
            update: {}, // no update needed
            create: {
              userId,
              conversationId,
              role: "MEMBER",
            },
          });
        } catch (e) {
          console.error(
            `Error inserting member userId=${userId} for conversation=${conversationId}`,
            e
          );
        }
      }
    }

    return {
      success: true,
      message: "Synced conversation members successfully",
    };
  } catch (error) {
    console.error("Error syncing conversation members:", error);
    return { success: false, message: "Failed to sync conversation members" };
  }
};
