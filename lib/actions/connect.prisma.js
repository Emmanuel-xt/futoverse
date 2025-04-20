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
            department: {
              select: {
                initial: true, // or whatever field you need
              },
            },
            level: {
              select: {
                name: true, // or value, depending on your schema
              },
            },
          },
        },
      },
    });

    console.log("Pending Friend Requests fetched successfully", pendingRequest);
    return pendingRequest;
  } catch (error) {
    console.log("Error fetching Friend Requests", error);
    return [];
  }
};

// export const acceptFrientRequest = async (currentUserId, requestSenderId) => {
//   console.log(
//     "Accept Friend Request was triggered by ",
//     currentUserId,
//     "to",
//     requestSenderId
//   );

//   try {
//     await prisma.$transaction(async (tx) => {
//       // 1. Update the request status to 'accepted'
//       await tx.friendRequest.update({
//         where: {
//           senderId_receiverId: {
//             senderId: requestSenderId,
//             receiverId: currentUserId,
//           },
//         },
//         data: {
//           status: "accepted",
//         },
//       });

//       // 2. Add sender to current user's friends
//       await tx.user.update({
//         where: { id: currentUserId },
//         data: {
//           friends: {
//             connect: { id: requestSenderId },
//           },
//         },
//       });

//       // 3. Add current user to sender's friends
//       await tx.user.update({
//         where: { id: requestSenderId },
//         data: {
//           friends: {
//             connect: { id: currentUserId },
//           },
//         },
//       });

//       // 4. Create or get the conversation
//       let conversation = await tx.conversation.findFirst({
//         where: {
//           participantIds: {
//             hasEvery: [currentUserId, requestSenderId],
//           },
//         },
//       });

//       if (!conversation) {
//         conversation = await tx.conversation.create({
//           data: {
//             participantIds: {
//               set: [currentUserId, requestSenderId],
//             },
//             // add any other fields here
//           },
//         });
//       }

//       // 5. Send system message
//       await tx.message.create({
//         data: {
//           conversationId: conversation.id,
//           senderId: 141618, // your "system" user id
//           body: "🎉 You're now friends! Start chatting!",
//         },
//       });
//     });

//     console.log("Friend request accepted and conversation initialized");
//     return true;
//   } catch (error) {
//     console.log("Error accepting Friend Request Flow", error);
//     return false;
//   }
// };

export const acceptFrientRequest = async (currentUserId, requestSenderId) => {
  console.log(
    "Accept Friend Request was triggered by ",
    currentUserId,
    "to",
    requestSenderId
  );

  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Update request to 'accepted'
      await tx.friendRequest.update({
        where: {
          senderId_receiverId: {
            senderId: requestSenderId,
            receiverId: currentUserId,
          },
        },
        data: {
          status: "accepted",
        },
      });

      // Step 2 & 3: Update both users' friends list
      await tx.user.update({
        where: { id: currentUserId },
        data: {
          friends: {
            connect: { id: requestSenderId },
          },
        },
      });

      await tx.user.update({
        where: { id: requestSenderId },
        data: {
          friends: {
            connect: { id: currentUserId },
          },
        },
      });

      // Step 4: Check if conversation exists or create
      const sortedIds = [currentUserId, requestSenderId].sort((a, b) => a - b);
      let conversation = await tx.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: sortedIds,
          },
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            participantIds: {
              set: sortedIds,
            },
          },
        });
      }

      // Step 5: Send system message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: 141618, // system user ID
          body: "🎉 You're now friends! Start chatting!",
        },
      });
    });

    console.log("✅ Friend request accepted and conversation initialized");
    return true;
  } catch (error) {
    console.error("❌ Error accepting friend request:", error);
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
