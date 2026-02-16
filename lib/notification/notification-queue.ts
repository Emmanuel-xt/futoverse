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

// Use dynamic imports to avoid bundling bullmq/ioredis into client code
let redis: any = null
let queue: any = null

async function getRedis() {
    if (!redis) {
        const { Redis } = await import("ioredis")
        redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
            maxRetriesPerRequest: null,
            lazyConnect: true,
        })

        redis.on("error", (err: Error) => {
            console.warn("[Redis] Connection error:", err.message)
        })
    }
    return redis
}

async function getQueue() {
    if (!queue) {
        const { Queue } = await import("bullmq")
        const redisInstance = await getRedis()
        queue = new Queue("notifications", {
            connection: redisInstance,
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
    }
    return queue
}

// Export for bull-board compatibility
export const notificationQueue = {
    get instance() {
        return getQueue()
    },
}

// Add notification to queue
export async function queueNotification(job: NotificationJob) {
    try {
        const q = await getQueue()
        const priority = job.priority === "high" ? 1 : job.priority === "low" ? 10 : 5

        return await q.add("send-notification", job, {
            priority,
            delay: job.delay || 0,
        })
    } catch (error) {
        console.warn("[Queue] Failed to queue notification — Redis may be unavailable:", (error as Error).message)
        return null
    }
}

// Batch notifications for efficiency
export async function queueBatchNotifications(notifications: NotificationJob[]) {
    try {
        const q = await getQueue()
        const jobs = notifications.map((notification: NotificationJob, index: number) => ({
            name: "send-notification",
            data: notification,
            opts: {
                priority: notification.priority === "high" ? 1 : notification.priority === "low" ? 10 : 5,
                delay: notification.delay || index * 100,
            },
        }))

        return await q.addBulk(jobs)
    } catch (error) {
        console.warn("[Queue] Failed to queue batch notifications — Redis may be unavailable:", (error as Error).message)
        return null
    }
}
