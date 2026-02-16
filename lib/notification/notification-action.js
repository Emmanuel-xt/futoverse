"use server";

import prisma from "@prisma/prisma";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { readFileSync } from "fs";
import { join } from "path";
import { validateInput } from "@lib/validations/validate";
import { createNotificationSchema, saveFcmTokenSchema } from "@lib/validations/schemas";

export async function createNotification({
  userId,
  senderId,
  type,
  title,
  body,
  link,
}) {
  const validation = validateInput(createNotificationSchema, { userId, senderId, type, title, body, link });
  if (!validation.success) throw new Error("Invalid input");

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: typeof userId === "string" ? parseInt(userId) : userId,
        senderId: senderId
          ? typeof senderId === "string"
            ? parseInt(senderId)
            : senderId
          : undefined,
        type,
        title,
        body,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
}

export async function saveFcmToken(token, userId) {
  const validation = validateInput(saveFcmTokenSchema, { token, userId });
  if (!validation.success) return { success: false, error: "Invalid input" };

  try {
    await prisma.fcmToken.upsert({
      where: { token }, // unique constraint on token
      update: { userId },
      create: { token, userId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return { success: false, error: error.message };
  }
}

// lib/server/send-notification.ts

// Initialize Admin SDK only once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), "service_key.json"), "utf-8")
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function sendPushNotification({ token, title, body, link }) {
  if (!token || !title) return { success: false, error: "Invalid input" };

  const payload = {
    token,
    // "eiWUtVB1IsgK4cb8B5iMNR:APA91bEwU-ZIyKPfGcP7yTnVlH4CwZ0vA4I8M0zFLhezQR4dV1OjlyMVyfYcSCbvExiPqqQM4pc8EA45uagTTP9jhAnVVT4k-YYFtSd2TXdvf6aQ4CgmDW0",
    notification: {
      title,
      body,
    },
    data: {
      link: link || "", // for foreground
    },
    webpush: {
      fcmOptions: {
        link: link || "", // for background
      },
    },
  };

  try {
    await admin.messaging().send(payload);
    return { success: true };
  } catch (err) {
    console.error("Error sending notification:", err);
    return { success: false, error: err.message };
  }
}
