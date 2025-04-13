"use server";

import prisma from "@prisma/prisma";
import { FriendRequestStatus } from "@prisma/client";

// use the enum
// const { FriendRequestStatus } = Prisma;

// export const sendFriendRequest = async (currentUserId, targetUserId) => {
//   console.log("About to send Friend Request", currentUserId, targetUserId);
//   try {
//     const send = await prisma.friendRequest.create({
//       data: {
//         senderId: currentUserId,
//         receiverId: targetUserId,
//         status: FriendRequestStatus.pending,
//       },
//     });
//     console.log("Friend Request sent successfully");
//     return true;
//   } catch (error) {
//     console.log("Error sending Friend Request", error);
//     return false;
//   }
// };
export const deleteTable = async () => {
  try {
    console.log("deleted table to send Friend Request");
    await prisma.friendRequest.deleteMany({});
    console.log("deleted table to send Friend Request");
  } catch (error) {
    console.log("error deleting table", error);
  }
};

export const sendFriendRequest = async (currentUserId, targetUserId) => {
  console.log("About to send Friend Request", currentUserId, targetUserId);

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
      console.log("Friend request already exists:", existingRequest.status);
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

    console.log("Friend Request sent successfully");
    return true;
  } catch (error) {
    console.log("Error sending Friend Request", error);
    return false;
  }
};

export const fetchPendingFriendRequests = async (currentUserId) => {
  console.log("About to fetch all Pending Friend Requests");
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
            department: true,
            level: true,
          },
        },
      },
    });

    console.log("Pending Friend Requests fetched successfully", pendingRequest);
    return pendingRequest;
  } catch (error) {
    console.log("Error fetching Friend Requests", error);
    return false;
  }
};

export const acceptFrientRequest = async (currentUserId, requestSenderId) => {
  console.log(
    "Accept Friend Request was triggered by ",
    currentUserId,
    "to",
    requestSenderId
  );

  try {
    await prisma.$transaction([
      // 1. Update the request status to 'accepted'
      prisma.friendRequest.update({
        where: {
          senderId_receiverId: {
            senderId: requestSenderId,
            receiverId: currentUserId,
          },
        },
        data: {
          status: "accepted",
        },
      }),

      // 2. Add sender to current user's friends
      prisma.user.update({
        where: { id: currentUserId },
        data: {
          friends: {
            connect: { id: requestSenderId },
          },
        },
      }),

      // 3. Add current user to sender's friends
      prisma.user.update({
        where: { id: requestSenderId },
        data: {
          friends: {
            connect: { id: currentUserId },
          },
        },
      }),
    ]);

    console.log("Friend request accepted and friendship established");
    return true;
  } catch (error) {
    console.log("Error accepting Friend Request Flow", error);
    return false;
  }
};

export const rejectFriendRequest = async (currentUserId, requestSenderId) => {
  console.log("About to Reject Friend Request");
  try {
    await prisma.friendRequest.update({
      where: {
        senderId_receiverId: {
          senderId: requestSenderId,
          receiverId: currentUserId,
        },
      },
      data: {
        status: "rejected",
      },
    });
    console.log("Friend Request status updated to REJECTED successfully");
    return true;
  } catch (error) {
    console.log("Error rejecting Friend Request", error);
    return false;
  }
};

export const fetchUsersFriendList = async (currentUserId) => {
  try {
    console.log("About to fetch User's Friend list");
    const friendList = await prisma.user.findUnique({
      where: { username: currentUserId },
      select: {
        id: true,
        username: true,
        name: true,
        friends: true,
      },
    });
    console.log("Friends fetched successfully", friendList);
    return friendList?.friends ?? [];
  } catch (error) {
    console.log("Error fetching User's friend list", error);
    return [];
  }
};

export const fetchUsersFriendCount = async (currentUsername) => {
  try {
    console.log("About to fetch User's Friend count");

    const result = await prisma.user.findUnique({
      where: { username: currentUsername },
      select: {
        _count: {
          select: { friends: true },
        },
      },
    });

    const count = result?._count?.friends || 0;
    console.log("Friend count fetched:", count);
    return count;
  } catch (error) {
    console.log("Error fetching User's friend count", error);
    return 0;
  }
};
