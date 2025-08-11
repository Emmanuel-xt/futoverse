"use server";

import prisma from "@prisma/prisma";

export async function addPoints(userId, points, action) {
  try {
    console.log("Adding points:", { userId, points, action });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    });

    // Log the action
    await prisma.pointsHistory.create({
      data: {
        userId,
        action,
        points,
      },
    });

    console.log("Points added successfully:", user);

    return user;
  } catch (error) {
    console.error("Error adding points:", error);
    // throw new Error("Failed to add points");
  }
}
