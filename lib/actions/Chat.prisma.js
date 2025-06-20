"use server";

import prisma from "@prisma/prisma";

// Fetch conversations where the authenticated user is a participant
export const getUsersForSidebar = async (authUserId) => {
  // console.log("Fetching conversations for user:", authUserId);

  const conversations = await prisma.conversation.findMany({
    where: {
      participantIds: {
        has: authUserId, // Ensure the authenticated user is a participant
      },
    },
    orderBy: {
      updatedAt: "desc", // Sort conversations by latest activity
    },
    select: {
      id: true,
      updatedAt: true,
      messages: {
        orderBy: {
          createdAt: "desc", // Get the most recent message
        },
        take: 1,
        select: {
          body: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      },
      participantIds: true, // Get the participant IDs so we can filter out authUserId
    },
  });

  // console.log("Fetched raw conversations:");

  // Fetch receiver's details (excluding the authenticated user)
  let usersForSidebar = await Promise.all(
    conversations.map(async (conversation) => {
      const receiverId = conversation.participantIds.find(
        (id) => id !== authUserId
      );
      if (!receiverId) return null; // Edge case: If no receiver is found, skip

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
            lastMessage: conversation.messages[0] || null, // Ensure lastMessage exists
            conversationId: conversation.id,
          }
        : null;
    })
  );

  // Remove any null values
  usersForSidebar = usersForSidebar.filter(Boolean);

  // 🔥 Explicitly sort users by their last message time (in case order changed in Promise.all)
  usersForSidebar.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || 0;
    const bTime = b.lastMessage?.createdAt || 0;
    return bTime - aTime; // Descending order (most recent first)
  });

  // console.log("Processed sidebar users:", usersForSidebar);

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
