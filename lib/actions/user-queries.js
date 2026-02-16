"use server";

import prisma from "@prisma/prisma";
import { validateInput } from "@lib/validations/validate";
import { usernameSchema, userIdSchema, searchQuerySchema } from "@lib/validations/schemas";

export const fetchUserByUsername = async (username) => {
  const v = validateInput(usernameSchema, { username });
  if (!v.success) return null;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        picture: true,
        about: true,
        bio: true,
        gender: true,
        points: true,
        department: {
          select: {
            name: true,
          },
        },
        level: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            shops: true,
            friends: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", username, error);
    return null;
  }
};

export const fetchOnlyUserInfo = async (username) => {
  const v = validateInput(usernameSchema, { username });
  if (!v.success) return null;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        department: true,
        level: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user info:", username, error);
    return null;
  }
};

export const fetchAllUsersForListing = async (currentUserId) => {
  const v = validateInput(userIdSchema, { userId: currentUserId });
  if (!v.success) return [];
  try {
    // Get current user's friends
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        friends: { select: { id: true } },
        sentRequests: { select: { receiverId: true } },
        receivedRequests: { select: { senderId: true } },
      },
    });

    const friendIds = currentUser?.friends.map((f) => f.id) || [];
    const sentRequestIds =
      currentUser?.sentRequests.map((r) => r.receiverId) || [];
    const receivedRequestIds =
      currentUser?.receivedRequests.map((r) => r.senderId) || [];

    // Fetch all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
        department: true,
        level: true,
      },
    });

    // Attach relationship status to each user
    const enrichedUsers = users.map((user) => ({
      ...user,
      isFriend: friendIds.includes(user.id),
      requestSent: sentRequestIds.includes(user.id),
      requestReceived: receivedRequestIds.includes(user.id),
    }));

    return enrichedUsers;
  } catch (error) {
    console.error("Error fetching users for listing:", error);
    return [];
  }
};

export const fetchAllUsers = async (currentUserId) => {
  const v = validateInput(userIdSchema, { userId: currentUserId });
  if (!v.success) return [];
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
        department: {
          select: {
            initial: true,
            name: true,
          },
        },
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Error fetching all users");
  }
};

export const fetchUnconnectedUsers = async (
  currentUserId,
  cursor = null,
  limit = 10
) => {
  const v = validateInput(userIdSchema, { userId: currentUserId });
  if (!v.success) return { users: [], nextCursor: null };
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        friends: { select: { id: true } },
        sentRequests: { select: { receiverId: true } },
        receivedRequests: { select: { senderId: true } },
      },
    });

    if (!currentUser) return { users: [], nextCursor: null };

    const excludedUserIds = new Set([
      currentUserId,
      ...currentUser.friends.map((f) => f.id),
      ...currentUser.sentRequests.map((r) => r.receiverId),
      ...currentUser.receivedRequests.map((r) => r.senderId),
    ]);

    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(excludedUserIds),
        },
        departmentId: { not: null },
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        username: true,
        picture: true,
        department: true,
        level: true,
      },
    });

    const hasMore = users.length > limit;
    const slicedUsers = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? users[limit].id : null;

    return {
      users: slicedUsers,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching paginated unconnected users:", error);
    return { users: [], nextCursor: null };
  }
};

export const searchUsers = async (query) => {
  const v = validateInput(searchQuerySchema, { query });
  if (!v.success) return [];
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { username: { contains: query, mode: "insensitive" } },
            ],
          },
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

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};
