"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getPosts, toggleLike, trackView } from "@lib/actions/post-actions";

export function usePosts(userId) {
  return useInfiniteQuery({
    queryKey: ["posts", userId],
    queryFn: ({ pageParam }) => getPosts(pageParam, 10, userId),
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: undefined,
  });
}

export function useLikeMutation(userId) {
  console.log("user id gotten at like mutation", userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }) => toggleLike(postId, userId),
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts", userId] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts", userId]);

      // Optimistically update
      queryClient.setQueryData(["posts", userId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) => {
              if (post.id === postId) {
                const isCurrentlyLiked = post.isLiked;
                return {
                  ...post,
                  isLiked: !isCurrentlyLiked,
                  _count: {
                    ...post._count,
                    likes: isCurrentlyLiked
                      ? post._count.likes - 1
                      : post._count.likes + 1,
                  },
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", userId], context.previousPosts);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
    },
  });
}

export function useTrackView() {
  return useMutation({
    mutationFn: ({ postId, userId }) => trackView(postId, userId),
  });
}
