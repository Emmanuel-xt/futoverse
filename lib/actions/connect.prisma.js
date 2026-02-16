"use server";

import prisma from "@prisma/prisma";
import { SYSTEM_USER_ID } from "@constants/app-config";
import { createNotification } from "../notification/notification-action";
import { AppNotifications } from "@lib/notification/app-notifications";
import { validateInput } from "@lib/validations/validate";
import { friendRequestSchema } from "@lib/validations/schemas";

// sends friend request to a user
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  const v = validateInput(friendRequestSchema, { currentUserId, targetUserId });
  if (!v.success) return { success: false, message: "Invalid input" };
  try {
    // 1. Check for existing requests
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "Friend request already exists.",
      };
    }

    // 3. Create request
    const send = await prisma.friendRequest.create({
      data: {
        senderId: currentUserId,
        receiverId: targetUserId,
        status: "pending",
      },
    });

    await AppNotifications.sendFriendRequest({
      senderId: currentUserId,
      receiverId: targetUserId,
    });

    return { success: true, message: "Friend request sent." };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, message: "Internal server error." };
  }
};

// fetches all pending requests belonging to an authenticated user
export const fetchPendingFriendRequests = async (currentUserId) => {
  if (!currentUserId) return [];
  try {
    const pendingRequest = await prisma.friendRequest.findMany({
      where: {
        receiverId: currentUserId,
        status: "pending",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            picture: true,
            username: true,
            department: {
              select: {
                initial: true,
              },
            },
            level: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // console.log("Pending Friend Requests fetched successfully", pendingRequest);
    return pendingRequest;
  } catch (error) {
    // console.log("Error fetching Friend Requests", error);
    return [];
  }
};

// updates friend request status , connects friends , opens a new conversation and send system message
export const acceptFriendRequest = async (currentUserId, requestSenderId) => {
  const v = validateInput(friendRequestSchema, { currentUserId, targetUserId: requestSenderId });
  if (!v.success) return { success: false, message: "Invalid input" };
  try {
    // Part 0: Fetch recipient details (for notification)
    const recipient = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      return { success: false, message: "Recipient not found." };
    }

    // Part 1: Transaction-safe operations (friend request + friendship)
    await prisma.$transaction([
      // Delete the friend request
      prisma.friendRequest.delete({
        where: {
          senderId_receiverId: {
            senderId: requestSenderId,
            receiverId: currentUserId,
          },
        },
      }),

      // Establish bidirectional friendship
      prisma.user.update({
        where: { id: currentUserId },
        data: { friends: { connect: { id: requestSenderId } } },
      }),
      prisma.user.update({
        where: { id: requestSenderId },
        data: { friends: { connect: { id: currentUserId } } },
      }),
    ]);

    // Part 2: Handle conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: { hasEvery: [currentUserId, requestSenderId] },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: { set: [currentUserId, requestSenderId] },
        },
      });
    }

    // Part 3: System message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: SYSTEM_USER_ID,
        body: "🎉 You're now friends! Start chatting!",
      },
    });

    // ✅ Part 4: Notification to the original sender
    await AppNotifications.sendFriendRequestAccepted({
      senderId: currentUserId,
      receiverId: requestSenderId,
    });

    return { success: true, message: "Friend request accepted." };
  } catch (error) {
    // console.error("Error accepting friend request:", error);
    return { success: false, message: "Internal server error." };
  }
};

// deletes the friendrequest
export const rejectFriendRequest = async (currentUserId, requestSenderId) => {
  const v = validateInput(friendRequestSchema, { currentUserId, targetUserId: requestSenderId });
  if (!v.success) return { success: false, message: "Invalid input" };
  try {
    // Part 1: Fetch recipient details (for notification)
    const recipient = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, name: true },
    });

    if (!recipient) {
      return { success: false, message: "Recipient not found." };
    }

    // Part 2: Delete the friend request
    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: {
          senderId: requestSenderId,
          receiverId: currentUserId,
        },
      },
    });

    // ✅ Part 3: Notification to the original sender
    await AppNotifications.sendFriendRequestDeclined({
      senderId: currentUserId,
      receiverId: requestSenderId,
    });

    return { success: true, message: "Friend request declined." };
  } catch (error) {
    // console.error("Error rejecting friend request:", error);
    return { success: false, message: "Internal server error." };
  }
};
// returns all the authenticated user's friends
export const fetchUsersFriendList = async (currentUserId) => {
  if (!currentUserId) return [];
  try {
    const friendList = await prisma.user.findUnique({
      where: { username: currentUserId },
      select: {
        id: true,
        username: true,
        name: true,
        friends: {
          select: {
            id: true,
            username: true,
            name: true,
            picture: true,
            department: {
              select: {
                initial: true,
              },
            },
            level: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    // console.log("Friends fetched successfully", friendList);
    return friendList?.friends ?? [];
  } catch (error) {
    console.log("Error fetching User's friend list", error);
    return [];
  }
};

export const fetchUsersFriendCount = async (currentUsername) => {
  if (!currentUsername) return 0;
  try {

    const result = await prisma.user.findUnique({
      where: { username: currentUsername },
      select: {
        _count: {
          select: { friends: true },
        },
      },
    });

    const count = result?._count?.friends || 0;
    // console.log("Friend count fetched:", count);
    return count;
  } catch (error) {
    // console.log("Error fetching User's friend count", error);
    return 0;
  }
};

// perfroms check to know if a user has already sent friend requestion to a particular user
export const hasSentFriendRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) return false;
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId,
      receiverId,
      status: "pending", // assuming you're using a status field
    },
  });

  return !!existingRequest;
};

// deletes the existing friendrequest
export const cancelFriendRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) return { success: false, error: "Invalid input" };
  try {
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: "pending", // Only cancel if still pending
      },
    });

    if (!existingRequest) {
      throw new Error("No pending friend request found to cancel.");
    }

    await prisma.friendRequest.delete({
      where: {
        id: existingRequest.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    return { success: false, error: error.message };
  }
};

// checks if two users are already friends usually to determine whether the 'send friend request' button should show
export const areFriends = async (userId1, userId2) => {
  if (!userId1 || !userId2) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId1 },
      include: {
        friends: true,
      },
    });

    return user?.friends.some((friend) => friend.id === userId2);
  } catch (error) {
    // console.log("Error checking are friends", error);
  }
};

// unfriend's a user
export const disconnectFriends = async (userId1, userId2) => {
  if (!userId1 || !userId2) return { success: false, message: "Invalid input" };
  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId1 },
        data: {
          friends: {
            disconnect: { id: userId2 },
          },
        },
      }),
      prisma.user.update({
        where: { id: userId2 },
        data: {
          friends: {
            disconnect: { id: userId1 },
          },
        },
      }),
    ]);

    // console.log("successfully disconnected");

    return { success: true, message: "Disconnected successfully" };
  } catch (error) {
    console.error("Error disconnecting friends:", error);
    return { success: false, message: "Failed to disconnect friends", error };
  }
};
