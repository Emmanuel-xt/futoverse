"use server"

import prisma from "@prisma/prisma"
import { revalidatePath } from "next/cache"

export interface PostWithDetails {
    id: string
    title: string | null
    content: string
    createdAt: Date
    updatedAt: Date
    isApproved: boolean
    isPinned: boolean
    creator: {
        id: number
        username: string
        name: string | null
        picture: string | null
    }
    media: {
        id: string
        url: string
        type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
    }[]
    _count: {
        likes: number
        comments: number
        views: number
    }
    isLiked?: boolean
}

export async function getPosts(cursor?: string, limit = 10, userId?: number) {
    console.log("Fetching posts with cursor:", cursor, "limit:", limit, "userId:", userId)
    try {
        const posts = await prisma.post.findMany({
            where: {
                isApproved: true,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                    },
                },
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        views: true,
                    },
                },
                ...(userId && {
                    likes: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            id: true,
                        },
                    },
                }),
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor,
                },
            }),
        })

        const postsWithLikeStatus = posts.map((post) => ({
            ...post,
            isLiked: userId ? post.likes?.length > 0 : false,
            likes: undefined, // Remove the likes array from response
        }))

        return {
            posts: postsWithLikeStatus,
            nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
        }
    } catch (error) {
        console.error("Error fetching posts:", error)
        throw new Error("Failed to fetch posts")
    }
}

export async function createPost(data: {
    title?: string
    content: string
    media?: { url: string; type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" }[]
    creatorId: number
}) {
    try {
        const post = await prisma.post.create({
            data: {
                title: data.title,
                content: data.content,
                creatorId: data.creatorId,
                isApproved: false, // Requires approval
                media: data.media
                    ? {
                        create: data.media,
                    }
                    : undefined,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                    },
                },
                media: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        views: true,
                    },
                },
            },
        })

        revalidatePath("/")
        return post
    } catch (error) {
        console.error("Error creating post:", error)
        throw new Error("Failed to create post")
    }
}

export async function toggleLike(postId: string, userId: number) {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        })

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            })
            return { liked: false }
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            })
            return { liked: true }
        }
    } catch (error) {
        console.error("Error toggling like:", error)
        throw new Error("Failed to toggle like")
    }
}

export async function trackView(postId: string, userId?: number) {
    try {
        await prisma.view.create({
            data: {
                postId,
                userId,
            },
        })
    } catch (error) {
        console.error("Error tracking view:", error)
        // Don't throw error for view tracking failures
    }
}

export async function getComments(postId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId,
                parentCommentId: null, // Only top-level comments
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                    },
                },
                replies: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                picture: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return comments
    } catch (error) {
        console.error("Error fetching comments:", error)
        throw new Error("Failed to fetch comments")
    }
}

export async function createComment(data: {
    content: string
    postId: string
    creatorId: number
    parentCommentId?: string
}) {
    try {
        const comment = await prisma.comment.create({
            data,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        picture: true,
                    },
                },
            },
        })

        revalidatePath("/")
        return comment
    } catch (error) {
        console.error("Error creating comment:", error)
        throw new Error("Failed to create comment")
    }
}
