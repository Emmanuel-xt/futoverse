"use server";

import prisma from "@prisma/prisma";

// sends friend request to a user
export const sendFriendRequest = async (currentUserId, targetUserId) => {
  // console.log("About to send Friend Request", currentUserId, targetUserId);

  try {
    // Check if a friend request already exists (either direction)
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: targetUserId,
          },
          {
            senderId: targetUserId,
            receiverId: currentUserId,
          },
        ],
      },
    });

    if (existingRequest) {
      // console.log("Friend request already exists:", existingRequest.status);
      return {
        success: false,
        message: "Friend request already sent or exists.",
      };
    }

    // Proceed to send the request
    const send = await prisma.friendRequest.create({
      data: {
        senderId: currentUserId,
        receiverId: targetUserId,
        status: "pending",
      },
    });

    // console.log("Friend Request sent successfully");
    return true;
  } catch (error) {
    // console.log("Error sending Friend Request", error);
    return false;
  }
};

// fetches all pending requests belonging to an authenticated user
export const fetchPendingFriendRequests = async (currentUserId) => {
  // console.log("About to fetch all Pending Friend Requests");
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
  try {
    // Part 1: Transaction-safe operations
    await prisma.$transaction([
      prisma.friendRequest.delete({
        where: {
          senderId_receiverId: {
            senderId: requestSenderId,
            receiverId: currentUserId,
          },
        },
      }),

      prisma.user.update({
        where: { id: currentUserId },
        data: {
          friends: {
            connect: { id: requestSenderId },
          },
        },
      }),

      prisma.user.update({
        where: { id: requestSenderId },
        data: {
          friends: {
            connect: { id: currentUserId },
          },
        },
      }),
    ]);

    // Part 2: Outside transaction – Check if conversation exists or create
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [currentUserId, requestSenderId],
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [currentUserId, requestSenderId],
          },
        },
      });
    }

    // Part 3: Send system message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: 141618, // System/bot user ID
        body: "🎉 You're now friends! Start chatting!",
      },
    });

    // console.log("✅ Friend request accepted and conversation initialized");
    return true;
  } catch (error) {
    console.error("❌ Error accepting friend request:", error);
    return false;
  }
};

// deletes the friendrequest
export const rejectFriendRequest = async (currentUserId, requestSenderId) => {
  // console.log("About to Reject (Delete) Friend Request");
  try {
    await prisma.friendRequest.delete({
      where: {
        senderId_receiverId: {
          senderId: requestSenderId,
          receiverId: currentUserId,
        },
      },
    });
    // console.log("Friend Request deleted successfully");
    return true;
  } catch (error) {
    // console.log("Error deleting Friend Request", error);
    return false;
  }
};

// returns all the authenticated user's friends
export const fetchUsersFriendList = async (currentUserId) => {
  try {
    // console.log("About to fetch User's Friend list");
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
          },
        },
      },
    });
    // console.log("Friends fetched successfully", friendList);
    return friendList?.friends ?? [];
  } catch (error) {
    // console.log("Error fetching User's friend list", error);
    return [];
  }
};

export const fetchUsersFriendCount = async (currentUsername) => {
  try {
    // console.log("About to fetch User's Friend count");

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
  // console.log("Checking are friends");

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
