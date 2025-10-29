import { Worker } from "bullmq"
import { Redis } from "ioredis"
import { sendPushNotification, createNotification } from "./notification-action"
import prisma from "@prisma/prisma"



const redis = new Redis(process.env.REDIS_URL )

// Logging Redis connection events
redis.on("connect", () => {
    console.log("[Redis] Connecting...")
})

redis.on("ready", () => {
    console.log("[Redis] Connected and ready!")
})

redis.on("error", (err) => {
    console.error("[Redis] Connection error:", err)
})

redis.on("end", () => {
    console.log("[Redis] Connection closed.")
})


export const notificationWorker = new Worker(
    "notifications",
    async (job) => {
        const { type, userId, userIds, senderId, title, body, link, notificationType } = job.data

        try {
            switch (type) {
                case "single":
                    await processSingleNotification({ userId, senderId, title, body, link, notificationType })
                    break

                case "batch":
                    await processBatchNotifications({ userIds, senderId, title, body, link, notificationType })
                    break

                case "broadcast":
                    await processBroadcastNotification({ senderId, title, body, link, notificationType })
                    break
            }
        } catch (error) {
            console.error("Notification job failed:", error)
            throw error
        }
    },
    {
        connection: redis,
        concurrency: 5, // Process 5 jobs concurrently
    },
)

async function processSingleNotification({ userId, senderId, title, body, link, notificationType }) {
    // Create notification record
    await createNotification({
        userId,
        senderId,
        type: notificationType,
        title,
        body,
        link,
    })

    // Get user's FCM tokens
    const tokens = await prisma.fcmToken.findMany({
        where: { userId },
        select: { token: true },
    })

    // Send push notifications to all user's devices
    const pushPromises = tokens.map(({ token }) => sendPushNotification({ token, title, body, link }))

    await Promise.allSettled(pushPromises)
}

async function processBatchNotifications({ userIds, senderId, title, body, link, notificationType }) {
    // Create notification records in batch
    const notificationData = userIds.map((userId) => ({
        userId,
        senderId,
        type: notificationType,
        title,
        body,
        link,
    }))

    await prisma.notification.createMany({
        data: notificationData,
    })

    // Get all FCM tokens for the users
    const tokens = await prisma.fcmToken.findMany({
        where: { userId: { in: userIds } },
        select: { token: true },
    })

    // Send push notifications in batches of 500 (FCM limit)
    const batchSize = 500
    for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize)
        const pushPromises = batch.map(({ token }) => sendPushNotification({ token, title, body, link }))
        await Promise.allSettled(pushPromises)
    }
}

async function processBroadcastNotification({ senderId, title, body, link, notificationType }) {
    // Get all active users (you might want to add conditions here)
    const users = await prisma.user.findMany({
        select: { id: true },
        where: {
            // Add your conditions for active users
            // e.g., lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
    })

    const userIds = users.map((user) => user.id)
    await processBatchNotifications({ userIds, senderId, title, body, link, notificationType })
}
