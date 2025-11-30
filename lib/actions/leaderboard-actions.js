"use server";

import prisma from "@prisma/prisma";
import { addPoints } from "./points.prisma";

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

    // Get top 100 users
    const topUsers = leaderboard.slice(0, 100);

    // Find current user's position
    let currentUser = null;
    if (currentUserId) {
      currentUser =
        leaderboard.find((user) => user.userId == currentUserId) || null;
    }

    console.log(
      `Leaderboard data fetched: ${topUsers.length} top users out of ${leaderboard.length}, current user: ${currentUser ? currentUser.userId : "N/A"}`
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

export async function checkAndAwardDailyReward(userId) {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Check if user has already claimed reward today
    const existingReward = await prisma.pointsHistory.findFirst({
      where: {
        userId,
        action: "DAILY_REWARD",
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingReward) {
      console.log("Already rewarded");
      return { rewarded: false, message: "Already claimed today" };
    }

    return { rewarded: true, points: 10 };
  } catch (error) {
    console.error("Error checking daily reward:", error);
    return null;
  }
}

export async function claimDailyReward(userId) {
  console.log("Claim Reward function was fired", userId);
  try {
    if (!userId) {
      return { error: "userId is required", rewarded: false };
    }

    const checkResult = await checkAndAwardDailyReward(userId);

    if (!checkResult) {
      return { error: "Failed to check daily reward", rewarded: false };
    }

    if (!checkResult.rewarded) {
      return {
        rewarded: false,
        message: checkResult.message,
      };
    }

    const result = await addPoints(userId, 10, "DAILY_REWARD");

    if (!result) {
      return { error: "Failed to add points", rewarded: false };
    }

    return {
      rewarded: true,
      points: 10,
      message: "Daily reward claimed successfully",
    };
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return { error: "Internal server error", rewarded: false };
  }
}
