"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, createComment } from "@lib/actions/post-actions";

export function useComments(postId) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data, variables) => {
      // Invalidate comments for the specific post
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      // Also invalidate posts to update comment count
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
