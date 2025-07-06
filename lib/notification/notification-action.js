"use server";

import prisma from "@prisma/prisma";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { readFileSync } from "fs";
import { join } from "path";

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

export async function saveFcmToken(token, userId) {
  try {
    console.log("Saving FCM token:", { token, userId });
    if (!token || !userId) throw new Error("Missing token or userId");

    await prisma.fcmToken.upsert({
      where: { token }, // unique constraint on token
      update: { userId },
      create: { token, userId },
    });
    console.log("FCM token saved successfully for user:", userId);

    return { success: true };
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return { success: false, error: error.message };
  }
}

// lib/server/send-notification.ts

// Initialize Admin SDK only once
if (!admin.apps.length) {
  console.log("There is no admin.app Initializing Firebase Admin SDK");
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), "service_key.json"), "utf-8")
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.log("There is an Admin App");
}

export async function sendPushNotification({ token, title, body, link }) {
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
    console.log("Sending notification with payload:", payload);

    const response = await admin.messaging().send(payload);
    console.log("Notification sent successfully", response);
    return { success: true };
  } catch (err) {
    console.error("Error sending notification:", err);
    return { success: false, error: err.message };
  }
}
