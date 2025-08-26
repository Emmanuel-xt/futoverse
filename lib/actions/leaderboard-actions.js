"use server";

import prisma from "@prisma/prisma";

export async function getLeaderboardData(currentUserId) {
  try {
    console.log("Fetching leaderboard data");
    // Get aggregated points for all users
    const userPoints = await prisma.pointsHistory.groupBy({
      by: ["userId"],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
    });

    console.log(`Found ${userPoints.length} users with points`);

    // Get user details for the aggregated data
    const userIds = userPoints.map((up) => up.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        department: {
          select: {
            name: true,
            initial: true,
          },
        },
        level: {
          select: {
            name: true,
          },
        },
      },
    });

    // Create user lookup map
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Build leaderboard with ranks
    const leaderboard = userPoints
      .map((up, index) => ({
        userId: up.userId,
        totalPoints: up._sum.points || 0,
        rank: index + 1,
        user: userMap.get(up.userId),
      }))
      .filter((item) => item.user); // Filter out users that might not exist

    // Get top 20 users
    const topUsers = leaderboard.slice(0, 20);

    // Find current user's position
    let currentUser = null;
    if (currentUserId) {
      currentUser =
        leaderboard.find((user) => user.userId == currentUserId) || null;
    }

    console.log(
      `Leaderboard data fetched: ${topUsers} top users out of ${leaderboard.length}, current user: ${currentUser ? currentUser.userId : "N/A"}`
    );

    return {
      topUsers,
      currentUser,
      totalUsers: leaderboard.length,
    };
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return {
      topUsers: [],
      currentUser: null,
      totalUsers: 0,
    };
  }
}

export async function getUserPointsHistory(userId) {
  return await prisma.pointsHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
