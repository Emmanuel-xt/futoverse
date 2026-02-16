import { Worker } from "bullmq"
import { Redis } from "ioredis"
import { sendPushNotification, createNotification } from "./notification-action"
import prisma from "@prisma/prisma"

let worker: Worker | null = null

export function startNotificationWorker() {
    if (worker) return worker

    const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
        maxRetriesPerRequest: null,
        lazyConnect: true,
    })

    redis.on("error", (err) => {
        console.warn("[Redis Worker] Connection error:", err.message)
    })

    worker = new Worker(
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
            concurrency: 5,
        },
    )

    return worker
}

// Export for backward compatibility — lazy, won't connect until startNotificationWorker() is called
export const notificationWorker = {
    get instance() {
        return startNotificationWorker()
    },
}

async function processSingleNotification({ userId, senderId, title, body, link, notificationType }: any) {
    await createNotification({
        userId,
        senderId,
        type: notificationType,
        title,
        body,
        link,
    })

    const tokens = await prisma.fcmToken.findMany({
        where: { userId },
        select: { token: true },
    })

    const pushPromises = tokens.map(({ token }) => sendPushNotification({ token, title, body, link }))
    await Promise.allSettled(pushPromises)
}

async function processBatchNotifications({ userIds, senderId, title, body, link, notificationType }: any) {
    const notificationData = userIds.map((userId: string) => ({
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

    const tokens = await prisma.fcmToken.findMany({
        where: { userId: { in: userIds } },
        select: { token: true },
    })

    const batchSize = 500
    for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize)
        const pushPromises = batch.map(({ token }) => sendPushNotification({ token, title, body, link }))
        await Promise.allSettled(pushPromises)
    }
}

async function processBroadcastNotification({ senderId, title, body, link, notificationType }: any) {
    const users = await prisma.user.findMany({
        select: { id: true },
    })

    const userIds = users.map((user) => user.id)
    await processBatchNotifications({ userIds, senderId, title, body, link, notificationType })
}
