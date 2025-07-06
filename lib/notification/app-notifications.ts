import prisma from "@prisma/prisma"
import { NotificationService } from "./notification-service"

// Specific notification handlers for your app actions
export class AppNotifications {
    // INLINE: Real-time chat messages
    static async sendChatMessage({
        senderId,
        receiverId,
        message,
        chatId,
    }: {
        senderId: string
        receiverId: string
        message: string
        chatId: string
    }) {
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
        })

        await NotificationService.sendInlineNotification({
            userId: receiverId,
            senderId,
            title: `New message from ${sender?.name}`,
            body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
            link: `/chat/${chatId}`,
            type: "CHAT_MESSAGE",
        })
    }

    // INLINE: Friend request received
    static async sendFriendRequest({
        senderId,
        receiverId,
    }: {
        senderId: string
        receiverId: string
    }) {
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
        })

        await NotificationService.sendInlineNotification({
            userId: receiverId,
            senderId,
            title: "New Friend Request",
            body: `${sender?.name} sent you a friend request`,
            link: `/friends/requests`,
            type: "FRIEND_REQUEST",
        })
    }

    // INLINE: Friend request accepted
    static async sendFriendRequestAccepted({
        senderId,
        receiverId,
    }: {
        senderId: string
        receiverId: string
    }) {
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
        })

        await NotificationService.sendInlineNotification({
            userId: receiverId,
            senderId,
            title: "Friend Request Accepted",
            body: `${sender?.name} accepted your friend request`,
            link: `/profile/${senderId}`,
            type: "FRIEND_REQUEST_ACCEPTED",
        })
    }

    static async sendFriendRequestDeclined({
        senderId,
        receiverId,
    }: {
        senderId: string
        receiverId: string
    }) {
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
        })

        await NotificationService.sendInlineNotification({
            userId: receiverId,
            senderId,
            title: "Friend Request Declined",
            body: `${sender?.name} declined your friend request`,
            link: `/profile/${senderId}`,
            type: "FRIEND_REQUEST_DECLINED",
        })
    }


    // QUEUED: Post likes (can be batched)
    static async sendPostLike({
        postId,
        likerId,
        postOwnerId,
    }: {
        postId: string
        likerId: number
        postOwnerId: number
    }) {
        if (likerId === postOwnerId) return // Don't notify self

        const liker = await prisma.user.findUnique({
            where: { id: likerId },
            select: { name: true },
        })

        await NotificationService.sendQueuedNotification({
            userId: postOwnerId,
            senderId: likerId,
            title: "Post Liked",
            body: `${liker?.name} liked your post`,
            link: `/post/${postId}`,
            type: "POST_LIKE",
            priority: "low",
            delay: 5000, // 5 second delay to batch similar notifications
        })
    }

    // QUEUED: Comments on posts
    static async sendPostComment({
        postId,
        commenterId,
        postOwnerId,
        comment,
    }: {
        postId: string
        commenterId: string
        postOwnerId: string
        comment: string
    }) {
        if (commenterId === postOwnerId) return

        const commenter = await prisma.user.findUnique({
            where: { id: commenterId },
            select: { name: true },
        })

        await NotificationService.sendQueuedNotification({
            userId: postOwnerId,
            senderId: commenterId,
            title: "New Comment",
            body: `${commenter?.name} commented: ${comment.substring(0, 50)}${comment.length > 50 ? "..." : ""}`,
            link: `/post/${postId}`,
            type: "POST_COMMENT",
            priority: "normal",
        })
    }

    // QUEUED: Comment replies
    static async sendCommentReply({
        postId,
        commentId,
        replierId,
        originalCommenterId,
        reply,
    }: {
        postId: string
        commentId: string
        replierId: string
        originalCommenterId: string
        reply: string
    }) {
        if (replierId === originalCommenterId) return

        const replier = await prisma.user.findUnique({
            where: { id: replierId },
            select: { name: true },
        })

        await NotificationService.sendQueuedNotification({
            userId: originalCommenterId,
            senderId: replierId,
            title: "Comment Reply",
            body: `${replier?.name} replied: ${reply.substring(0, 50)}${reply.length > 50 ? "..." : ""}`,
            link: `/post/${postId}#comment-${commentId}`,
            type: "COMMENT_REPLY",
            priority: "normal",
        })
    }

    // QUEUED: Store creation
    static async sendStoreCreated({
        storeId,
        ownerId,
        storeName,
    }: {
        storeId: string
        ownerId: string
        storeName: string
    }) {
        // Notify friends about new store
        const friends = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: ownerId, status: "ACCEPTED" },
                    { friendId: ownerId, status: "ACCEPTED" },
                ],
            },
            select: {
                userId: true,
                friendId: true,
            },
        })

        const friendIds = friends.map((f) => (f.userId === ownerId ? f.friendId : f.userId))

        const owner = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { name: true },
        })

        if (friendIds.length > 0) {
            await NotificationService.sendBatchNotification({
                userIds: friendIds,
                senderId: ownerId,
                title: "New Store Created",
                body: `${owner?.name} created a new store: ${storeName}`,
                link: `/store/${storeId}`,
                type: "STORE_CREATED",
                priority: "low",
            })
        }
    }

    // QUEUED: New items in store
    static async sendStoreItemAdded({
        storeId,
        itemId,
        ownerId,
        itemName,
    }: {
        storeId: string
        itemId: string
        ownerId: string
        itemName: string
    }) {
        // Notify store followers
        const followers = await prisma.storeFollower.findMany({
            where: { storeId },
            select: { userId: true },
        })

        if (followers.length === 0) return

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { name: true },
        })

        await NotificationService.sendBatchNotification({
            userIds: followers.map((f) => f.userId),
            senderId: ownerId,
            title: "New Item Added",
            body: `New item "${itemName}" added to ${store?.name}`,
            link: `/store/${storeId}/item/${itemId}`,
            type: "STORE_ITEM_ADDED",
            priority: "low",
        })
    }
}
