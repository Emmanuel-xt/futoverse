"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPost, updatePost, deletePost, checkUserCanPost } from "@lib/actions/post-actions"
import { updateComment, deleteComment } from "@lib/actions/post-actions"

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title?: string
      content: string
      media?: { url: string; type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" }[]
      creatorId: number
    }) => {
      // Check permissions before creating
      const canPost = await checkUserCanPost(data.creatorId)
      if (!canPost) {
        throw new Error("You don't have permission to create posts")
      }
      return createPost(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      data,
      userId,
    }: {
      postId: string
      data: {
        title?: string
        content: string
        media?: { url: string; type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" }[]
      }
      userId: number
    }) => updatePost(postId, data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: number }) => deletePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
      content,
      userId,
    }: {
      commentId: string
      content: string
      userId: number
    }) => updateComment(commentId, content, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: number }) => deleteComment(commentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
  })
}
