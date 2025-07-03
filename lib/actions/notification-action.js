"use server";

import prisma from "@prisma/prisma";

export async function createNotification({
  userId,
  senderId,
  type,
  title,
  body,
  link,
}) {
  try {
    console.log("Creating notification with data:", {
      userId,
      senderId,
      type,
      title,
      body,
      link,
    });
    const notification = await prisma.notification.create({
      data: {
        userId,
        senderId,
        type,
        title,
        body,
        link,
      },
    });
    console.log("Notification created successfully:", notification);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}
