"use server";

import prisma from "@prisma/prisma";

// Fetch conversations where the authenticated user is a participant
export const getUsersForSidebar = async (authUserId) => {
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
          select: {
            id: true,
            name: true,
            username: true,
            picture: true,
          },
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

  // console.log("Users for ", usersForSidebar);

  return usersForSidebar;
};

export const getSearchedUsersForConversation = async (search) => {
  // console.log("about to fetched users based on search", search);

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
      },
      take: 10,
    });

    // console.log("Some users were found", users);
    return users;
  } catch (error) {
    console.log("error fetching searched users", error);
    return;
  }
};

export const findOrCreateConversation = async (currentUserId, receiverId) => {
  console.log("about to find or create conversation", receiverId);

  if (!currentUserId || !receiverId) return;
  try {
    // Check if conversation exists
    let convo = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [currentUserId, receiverId],
        },
      },
      include: {
        participants: true,
      },
    });

    // If not, create it
    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [currentUserId, receiverId],
          },
        },
      });
    }

    // const receiverId = convo.participantIds.find((id) => id !== authUserId);
    // if (!receiverId) return null; // Edge case: If no receiver is found, skip

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
      },
    });

    // console.log("reciver was found", receiver);

    return receiver;
  } catch (error) {
    console.log("error finding or creationg conversation", error);
    return;
  }
};
export const getConversationByUserId = async (currentUserId, receiverId) => {
  console.log("about to find or create conversation", receiverId);

  if (!currentUserId || !receiverId) return;
  try {
    // Check if conversation exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [currentUserId, receiverId],
        },
      },
      include: {
        participants: true,
      },
    });

    // If not, create it
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
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
      },
    });

    console.log("conversation was found or created", conversation);
    return receiver;
  } catch (error) {
    console.log("error finding or creationg conversation", error);
    return;
  }
};

// Fetches  user data for DM
export const getUserForConversation = async (id) => {
  try {
    // console.log("about to fetch user profile for personal convo");
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        picture: true,
        username: true,
      },
    });
    // console.log("user were found", user);
    return user;
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error);
  }
};

// fetches all the messages between two users
export const getMessagesOfUsers = async (receiverId, senderId) => {
  console.log(
    "about to fetch messages between two users",
    receiverId,
    senderId
  );
  try {
    // Convert IDs to string
    const sender = parseFloat(senderId);

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [sender, receiverId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // if the two users dont have not chatted before , return an empty message object
    if (!conversation) {
      // console.log("participants have no data");
      return [];
    }

    // console.log("participants have a created merger");
    return conversation.messages;
  } catch (error) {
    console.error("Error in getMessages: ", error);
    // Optionally rethrow or handle the error here
  }
};

// creates a conversation array to hold two users' message and also updates it with new messages
export const sendMessageToUser = async ({ message, receiverId, senderId }) => {
  try {
    const sender = parseFloat(senderId);

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [sender, receiverId],
        },
      },
    });

    // the very first message is being sent, that's why we need to create a new conversation
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [sender, receiverId],
          },
        },
      });
    }

    // creates the new message to be sent
    const newMessage = await prisma.message.create({
      data: {
        senderId: sender,
        body: message,
        conversationId: conversation.id,
      },
    });

    // updaate the conversation array with the new message
    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          messages: {
            connect: {
              id: newMessage.id,
            },
          },
        },
      });
      // console.log("new message was sent", newMessage);
    }

    return newMessage;
  } catch (error) {
    console.error("Error in sendMessage: ", error);
  }
};

// when called , updates the isRead property to true
export const markMessagesAsRead = async (conversationId, authUserId) => {
  console.log("Marking messages as read for conversation:", conversationId);
  console.log("authUserId:", authUserId, typeof authUserId);
  console.log("Expected senderId in DB is number?");

  try {
    // Update unread messages where the receiver is NOT the sender
    const updatedMessages = await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: Number(authUserId) }, // Ensure we are marking messages from the other user
        isRead: false, // Only update unread messages
      },
      data: {
        isRead: true,
      },
    });

    console.log("Updated messages:", updatedMessages);
    return updatedMessages;
  } catch (error) {
    console.log("Error marking messages as read", error);
  }
};

export const createGroupChat = async (form) => {
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

    console.log("New Group", newGroup);
    await prisma.message.create({
      data: {
        conversationId: newGroup.id,
        senderId: 141618, // System/bot user ID
        body: `${creatorName} created ${name} `,
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating group:", error);
    return;
  }
};

export const fetchAllGroups = async () => {
  console.log("about to fetch all group chats");
  try {
    const groups = await prisma.conversation.findMany({
      where: {
        isGroup: true,
      },
    });
    console.log("All groups were found", groups);
  } catch (error) {
    console.log("Error fetching groups", error);
  }
};

export const syncConversationMembers = async () => {
  console.log("Bomb is about to explode");
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
