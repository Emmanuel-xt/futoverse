"use server"

import { revalidatePath } from "next/cache"
import prisma from "@prisma/prisma";


// Types for server actions
export type CreateReelInput = {
    embedUrl: string
    originalUrl: string
    platform: "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "FACEBOOK"
    thumbnailUrl?: string
    tiktokEmbedHtml?: string
    caption?: string
    hashtags?: string[]
    postedById: number
}

export type UpdateReelInput = {
    id: string
    caption?: string
    hashtags?: string[]
    thumbnailUrl?: string
    isActive?: boolean
}

export type GetReelsOptions = {
    page?: number
    limit?: number
    platform?: "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "FACEBOOK"
    userId?: number
    sortBy?: "createdAt" | "viewCount" | "likes"
    sortOrder?: "asc" | "desc"
}

export type AddCommentInput = {
    reelId: string
    userId: number
    content: string
    parentCommentId?: string
}

export type DeleteCommentInput = {
    commentId: string
    userId: number
}

/**
 * Create a new embedded reel
 */
export async function createReel(input: CreateReelInput) {
    try {
        const reel = await prisma.embeddedReel.create({
            data: {
                embedUrl: input.embedUrl,
                originalUrl: input.originalUrl,
                platform: input.platform,
                thumbnailUrl: input.thumbnailUrl,
                tiktokEmbedHtml: input.tiktokEmbedHtml,
                caption: input.caption,
                hashtags: input.hashtags || [],
                postedById: input.postedById,
            },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                        department: { select: { name: true, initial: true } },
                        level: { select: { name: true } },
                    },
                },
                _count: {
                    select: { likes: true, comments: true, shares: true },
                },
            },
        })

        revalidatePath("/reels")
        revalidatePath("/")

        return { success: true, data: reel }
    } catch (error) {
        console.error("Failed to create reel:", error)
        return { success: false, error: "Failed to create reel" }
    }
}

/**
 * Get all reels with pagination and filtering
 */
export async function getReels(options?: GetReelsOptions) {
    try {
        const { page = 1, limit = 10, platform, userId, sortBy = "createdAt", sortOrder = "desc" } = options || {}

        const skip = (page - 1) * limit

        const where: {
            isActive: boolean
            platform?: "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "FACEBOOK"
            postedById?: number
        } = { isActive: true }

        if (platform) where.platform = platform
        if (userId) where.postedById = userId

        const orderBy: Record<string, "asc" | "desc" | { _count: "asc" | "desc" }> = {}
        if (sortBy === "likes") {
            orderBy.likes = { _count: sortOrder }
        } else {
            orderBy[sortBy] = sortOrder
        }

        const [reels, total] = await Promise.all([
            prisma.embeddedReel.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    postedBy: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            picture: true,
                            department: { select: { name: true, initial: true } },
                            level: { select: { name: true } },
                        },
                    },
                    _count: {
                        select: { likes: true, comments: true, shares: true },
                    },
                },
            }),
            prisma.embeddedReel.count({ where }),
        ])

        return {
            success: true,
            data: reels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total,
            },
        }
    } catch (error) {
        console.error("Failed to get reels:", error)
        return { success: false, error: "Failed to fetch reels" }
    }
}

/**
 * Get a specific reel by ID
 */
export async function getReelById(id: string, currentUserId?: number) {
    try {
        const reel = await prisma.embeddedReel.findUnique({
            where: { id, isActive: true },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                        department: { select: { name: true, initial: true } },
                        level: { select: { name: true } },
                    },
                },
                _count: {
                    select: { likes: true, comments: true, shares: true },
                },
            },
        })

        if (!reel) {
            return { success: false, error: "Reel not found" }
        }

        // Check if current user has liked this reel
        let isLiked = false
        if (currentUserId) {
            const like = await prisma.embeddedReelLike.findUnique({
                where: { reelId_userId: { reelId: id, userId: currentUserId } },
            })
            isLiked = !!like
        }

        return {
            success: true,
            data: {
                ...reel,
                isLiked,
            },
        }
    } catch (error) {
        console.error("Failed to get reel:", error)
        return { success: false, error: "Failed to fetch reel" }
    }
}

/**
 * Get reels by platform
 */
export async function getReelsByPlatform(
    platform: "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "FACEBOOK",
    options?: { page?: number; limit?: number },
) {
    return getReels({ ...options, platform })
}

/**
 * Get reels by user
 */
export async function getReelsByUser(userId: number, options?: { page?: number; limit?: number }) {
    return getReels({ ...options, userId })
}

/**
 * Get trending reels (most viewed/liked)
 */
export async function getTrendingReels(options?: { page?: number; limit?: number }) {
    return getReels({ ...options, sortBy: "viewCount", sortOrder: "desc" })
}

/**
 * Update a reel
 */
export async function updateReel(input: UpdateReelInput) {
    try {
        const reel = await prisma.embeddedReel.update({
            where: { id: input.id },
            data: {
                caption: input.caption,
                hashtags: input.hashtags,
                thumbnailUrl: input.thumbnailUrl,
                isActive: input.isActive,
                updatedAt: new Date(),
            },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                        department: { select: { name: true, initial: true } },
                        level: { select: { name: true } },
                    },
                },
                _count: {
                    select: { likes: true, comments: true, shares: true },
                },
            },
        })

        revalidatePath("/reels")
        revalidatePath(`/reels/${input.id}`)

        return { success: true, data: reel }
    } catch (error) {
        console.error("Failed to update reel:", error)
        return { success: false, error: "Failed to update reel" }
    }
}

/**
 * Delete a reel (soft delete)
 */
export async function deleteReel(id: string, userId?: number) {
    try {
        // Check ownership first if userId provided
        if (userId) {
            const reel = await prisma.embeddedReel.findUnique({ where: { id } })
            if (!reel || reel.postedById !== userId) {
                return { success: false, error: "Unauthorized" }
            }
        }

        await prisma.embeddedReel.update({
            where: { id },
            data: { isActive: false, updatedAt: new Date() },
        })

        revalidatePath("/reels")
        revalidatePath("/")

        return { success: true }
    } catch (error) {
        console.error("Failed to delete reel:", error)
        return { success: false, error: "Failed to delete reel" }
    }
}

/**
 * Permanently delete a reel (admin only)
 */
export async function hardDeleteReel(id: string) {
    try {
        // Delete related records first due to foreign key constraints
        await prisma.$transaction([
            prisma.embeddedReelLike.deleteMany({ where: { reelId: id } }),
            prisma.embeddedReelComment.deleteMany({ where: { reelId: id } }),
            prisma.embeddedReelShare.deleteMany({ where: { reelId: id } }),
            prisma.embeddedReel.delete({ where: { id } }),
        ])

        revalidatePath("/reels")
        revalidatePath("/")

        return { success: true }
    } catch (error) {
        console.error("Failed to hard delete reel:", error)
        return { success: false, error: "Failed to delete reel" }
    }
}

/**
 * Like/Unlike a reel (toggle)
 */
export async function toggleReelLike(reelId: string, userId: number) {
    try {
        const existingLike = await prisma.embeddedReelLike.findUnique({
            where: { reelId_userId: { reelId, userId } },
        })

        if (existingLike) {
            await prisma.embeddedReelLike.delete({ where: { id: existingLike.id } })
            revalidatePath("/reels")
            return { success: true, liked: false }
        }

        await prisma.embeddedReelLike.create({
            data: { reelId, userId },
        })

        revalidatePath("/reels")
        return { success: true, liked: true }
    } catch (error) {
        console.error("Failed to toggle like:", error)
        return { success: false, error: "Failed to toggle like" }
    }
}

/**
 * Check if user has liked a reel
 */
export async function hasUserLikedReel(reelId: string, userId: number) {
    try {
        const like = await prisma.embeddedReelLike.findUnique({
            where: { reelId_userId: { reelId, userId } },
        })
        return { success: true, liked: !!like }
    } catch (error) {
        console.error("Failed to check like status:", error)
        return { success: false, error: "Failed to check like status" }
    }
}

/**
 * Get like count for a reel
 */
export async function getReelLikeCount(reelId: string) {
    try {
        const count = await prisma.embeddedReelLike.count({ where: { reelId } })
        return { success: true, count }
    } catch (error) {
        console.error("Failed to get like count:", error)
        return { success: false, error: "Failed to get like count" }
    }
}

/**
 * Add a comment to a reel
 */
export async function addReelComment(input: AddCommentInput) {
    try {
        const comment = await prisma.embeddedReelComment.create({
            data: {
                reelId: input.reelId,
                userId: input.userId,
                content: input.content,
                parentCommentId: input.parentCommentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                    },
                },
            },
        })

        revalidatePath("/reels")
        revalidatePath(`/reels/${input.reelId}`)

        return { success: true, data: comment }
    } catch (error) {
        console.error("Failed to add comment:", error)
        return { success: false, error: "Failed to add comment" }
    }
}

/**
 * Get comments for a reel
 */
export async function getReelComments(reelId: string, options?: { page?: number; limit?: number }) {
    try {
        const { page = 1, limit = 20 } = options || {}
        const skip = (page - 1) * limit

        const [comments, total] = await Promise.all([
            prisma.embeddedReelComment.findMany({
                where: { reelId, parentCommentId: null, isDeleted: false },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            picture: true,
                        },
                    },
                    replies: {
                        where: { isDeleted: false },
                        orderBy: { createdAt: "asc" },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    picture: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.embeddedReelComment.count({
                where: { reelId, parentCommentId: null, isDeleted: false },
            }),
        ])

        return {
            success: true,
            data: comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total,
            },
        }
    } catch (error) {
        console.error("Failed to get comments:", error)
        return { success: false, error: "Failed to fetch comments" }
    }
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteReelComment(input: DeleteCommentInput) {
    try {
        const comment = await prisma.embeddedReelComment.findUnique({
            where: { id: input.commentId },
        })

        if (!comment || comment.userId !== input.userId) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.embeddedReelComment.update({
            where: { id: input.commentId },
            data: { isDeleted: true },
        })

        revalidatePath("/reels")

        return { success: true }
    } catch (error) {
        console.error("Failed to delete comment:", error)
        return { success: false, error: "Failed to delete comment" }
    }
}

/**
 * Share a reel (track share event)
 */
export async function shareReel(reelId: string, userId: number, platform?: string) {
    try {
        await prisma.embeddedReelShare.create({
            data: { reelId, userId, platform },
        })

        revalidatePath("/reels")
        return { success: true }
    } catch (error) {
        console.error("Failed to share reel:", error)
        return { success: false, error: "Failed to share reel" }
    }
}

/**
 * Get share count for a reel
 */
export async function getReelShareCount(reelId: string) {
    try {
        const count = await prisma.embeddedReelShare.count({ where: { reelId } })
        return { success: true, count }
    } catch (error) {
        console.error("Failed to get share count:", error)
        return { success: false, error: "Failed to get share count" }
    }
}

/**
 * Increment view count for a reel
 */
export async function incrementReelView(reelId: string) {
    try {
        await prisma.embeddedReel.update({
            where: { id: reelId },
            data: { viewCount: { increment: 1 } },
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to increment view:", error)
        return { success: false, error: "Failed to increment view" }
    }
}

/**
 * Get reel stats (views, likes, comments, shares)
 */
export async function getReelStats(reelId: string) {
    try {
        const reel = await prisma.embeddedReel.findUnique({
            where: { id: reelId },
            select: {
                viewCount: true,
                _count: {
                    select: { likes: true, comments: true, shares: true },
                },
            },
        })

        if (!reel) {
            return { success: false, error: "Reel not found" }
        }

        return {
            success: true,
            data: {
                viewCount: reel.viewCount,
                likesCount: reel._count.likes,
                commentsCount: reel._count.comments,
                sharesCount: reel._count.shares,
            },
        }
    } catch (error) {
        console.error("Failed to get reel stats:", error)
        return { success: false, error: "Failed to get reel stats" }
    }
}

/**
 * Batch get multiple reels by IDs
 */
export async function getReelsByIds(ids: string[], currentUserId?: number) {
    try {
        const reels = await prisma.embeddedReel.findMany({
            where: { id: { in: ids }, isActive: true },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                        department: { select: { name: true, initial: true } },
                        level: { select: { name: true } },
                    },
                },
                _count: {
                    select: { likes: true, comments: true, shares: true },
                },
            },
        })

        // Check like status for each reel if user is logged in
        if (currentUserId) {
            const likes = await prisma.embeddedReelLike.findMany({
                where: {
                    reelId: { in: ids },
                    userId: currentUserId,
                },
                select: { reelId: true },
            })
            const likedReelIds = new Set(likes.map((l) => l.reelId))

            return {
                success: true,
                data: reels.map((reel) => ({
                    ...reel,
                    isLiked: likedReelIds.has(reel.id),
                })),
            }
        }

        return {
            success: true,
            data: reels.map((reel) => ({ ...reel, isLiked: false })),
        }
    } catch (error) {
        console.error("Failed to get reels by IDs:", error)
        return { success: false, error: "Failed to fetch reels" }
    }
}

/**
 * Search reels by caption or hashtags
 */
export async function searchReels(query: string, options?: { page?: number; limit?: number }) {
    try {
        const { page = 1, limit = 10 } = options || {}
        const skip = (page - 1) * limit

        const [reels, total] = await Promise.all([
            prisma.embeddedReel.findMany({
                where: {
                    isActive: true,
                    OR: [{ caption: { contains: query, mode: "insensitive" } }, { hashtags: { has: query } }],
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    postedBy: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            picture: true,
                            department: { select: { name: true, initial: true } },
                            level: { select: { name: true } },
                        },
                    },
                    _count: {
                        select: { likes: true, comments: true, shares: true },
                    },
                },
            }),
            prisma.embeddedReel.count({
                where: {
                    isActive: true,
                    OR: [{ caption: { contains: query, mode: "insensitive" } }, { hashtags: { has: query } }],
                },
            }),
        ])

        return {
            success: true,
            data: reels,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total,
            },
        }
    } catch (error) {
        console.error("Failed to search reels:", error)
        return { success: false, error: "Failed to search reels" }
    }
}
