import { Queue } from "bullmq"
import { Redis } from "ioredis"

// Initialize Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// // Logging Redis connection events
redis.on("connect", () => {
    console.log("[Redis] Connecting... redis for queue")
})

redis.on("ready", () => {
    console.log("[Redis] Connected and ready! for queue")
})

redis.on("error", (err) => {
    console.error("[Redis] Connection error for queue:", err)
})

// redis.on("end", () => {
//     console.log("[Redis] Connection closed for queue.")
// })


// Create notification queue
export const notificationQueue = new Queue("notifications", {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    },
})

// Job types for different notification scenarios
export interface NotificationJob {
    type: "single" | "batch" | "broadcast"
    userId?: string
    userIds?: string[]
    senderId: string
    title: string
    body: string
    link?: string
    notificationType: string
    priority?: "low" | "normal" | "high"
    delay?: number
}

// Add notification to queue
export async function queueNotification(job: NotificationJob) {
    const priority = job.priority === "high" ? 1 : job.priority === "low" ? 10 : 5

    return await notificationQueue.add("send-notification", job, {
        priority,
        delay: job.delay || 0,
    })
}

// Batch notifications for efficiency
export async function queueBatchNotifications(notifications: NotificationJob[]) {
    const jobs = notifications.map((notification, index) => ({
        name: "send-notification",
        data: notification,
        opts: {
            priority: notification.priority === "high" ? 1 : notification.priority === "low" ? 10 : 5,
            delay: notification.delay || index * 100, // Stagger by 100ms
        },
    }))

    return await notificationQueue.addBulk(jobs)
}
