import { queueNotification } from "./notification-queue"
import { sendPushNotification, createNotification } from "./notification-action"
import prisma from "@prisma/prisma"

// Notification service with inline vs queue logic
export class NotificationService {
    // Inline notifications for real-time actions
    static async sendInlineNotification({
        userId,
        senderId,
        title,
        body,
        link,
        type,
    }: {
        userId: string
        senderId: string
        title: string
        body: string
        link?: string
        type: string
    }) {
        try {
            // Create notification record immediately
            await createNotification({
                userId,
                senderId,
                type,
                title,
                body,
                link,
            })

            // Send push notification immediately
            const tokens = await prisma.fcmToken.findMany({
                where: { userId },
                select: { token: true },
            })

            const pushPromises = tokens.map(({ token }) => sendPushNotification({ token, title, body, link }))

            await Promise.allSettled(pushPromises)
        } catch (error) {
            console.error("Inline notification failed:", error)
            // Fallback to queue
            await this.sendQueuedNotification({
                userId,
                senderId,
                title,
                body,
                link,
                type,
                priority: "high",
            })
        }
    }

    // Queued notifications for non-critical actions
    static async sendQueuedNotification({
        userId,
        senderId,
        title,
        body,
        link,
        type,
        priority = "normal",
        delay = 0,
    }: {
        userId: string
        senderId: string
        title: string
        body: string
        link?: string
        type: string
        priority?: "low" | "normal" | "high"
        delay?: number
    }) {
        return await queueNotification({
            type: "single",
            userId,
            senderId,
            title,
            body,
            link,
            notificationType: type,
            priority,
            delay,
        })
    }

    // Batch notifications for multiple users
    static async sendBatchNotification({
        userIds,
        senderId,
        title,
        body,
        link,
        type,
        priority = "normal",
    }: {
        userIds: string[]
        senderId: string
        title: string
        body: string
        link?: string
        type: string
        priority?: "low" | "normal" | "high"
    }) {
        return await queueNotification({
            type: "batch",
            userIds,
            senderId,
            title,
            body,
            link,
            notificationType: type,
            priority,
        })
    }
}
