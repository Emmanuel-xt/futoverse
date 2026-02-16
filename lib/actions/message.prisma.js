"use server";

import { AppNotifications } from "@lib/notification/app-notifications";
import prisma from "@prisma/prisma";
import { validateInput } from "@lib/validations/validate";
import { sendMessageSchema, getMessagesSchema, markMessagesReadSchema } from "@lib/validations/schemas";

// fetches messages between two users with pagination
export const getMessagesOfUsers = async (receiverId, senderId, cursor = null, limit = 50) => {
  const v = validateInput(getMessagesSchema, { receiverId, senderId });
  if (!v.success) return { messages: [], nextCursor: null, hasMore: false };
  try {
    const sender = parseFloat(senderId);

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [sender, receiverId],
        },
      },
      select: { id: true },
    });

    if (!conversation) {
      return { messages: [], nextCursor: null, hasMore: false };
    }

    // Fetch messages with cursor-based pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "desc", // Fetch newest first for pagination
      },
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
    });

    const hasMore = messages.length > limit;
    const paginatedMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? paginatedMessages[paginatedMessages.length - 1]?.id : null;

    // Reverse to get chronological order (oldest first) for display
    return {
      messages: paginatedMessages.reverse(),
      nextCursor,
      hasMore,
    };
  } catch (error) {
    console.error("Error in getMessages: ", error);
    return { messages: [], nextCursor: null, hasMore: false };
  }
};

// Legacy function for backward compatibility (fetches all messages)
export const getAllMessagesOfUsers = async (receiverId, senderId) => {
  const v = validateInput(getMessagesSchema, { receiverId, senderId });
  if (!v.success) return [];
  try {
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

    if (!conversation) {
      return [];
    }

    return conversation.messages;
  } catch (error) {
    console.error("Error in getAllMessages: ", error);
    return [];
  }
};

// creates a conversation array to hold two users' message and also updates it with new messages
export const sendMessageToUser = async ({ message, receiverId, senderId }) => {
  const v = validateInput(sendMessageSchema, { message, receiverId, senderId });
  if (!v.success) return null;
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

    // update the conversation array with the new message
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
      await AppNotifications.sendChatMessage({
        senderId,
        receiverId,
        message,
        chatId: conversation.id.toString(),
      });
    }

    return newMessage;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return null;
  }
};

// when called, updates the isRead property to true
export const markMessagesAsRead = async (conversationId, authUserId) => {
  const v = validateInput(markMessagesReadSchema, { conversationId, authUserId });
  if (!v.success) return null;
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

    return updatedMessages;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return null;
  }
};
