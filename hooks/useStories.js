"use client";

import { useCallback } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createStory,
  getStoriesFromFriends,
  markStoryAsViewed,
} from "@lib/actions/status.prisma";
// import {
//   getStoriesFromFriends,
//   markStoryAsViewed,
//   createStory,
// } from "@lib/actions/stories.actions";

export const useStories = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const {
    data: stories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stories", session?.user?.id],
    queryFn: () => getStoriesFromFriends(Number(session?.user?.id)),
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const viewStoryMutation = useMutation({
    mutationFn: markStoryAsViewed,
    onSuccess: (data, variables) => {
      // Update the stories cache to mark as viewed
      queryClient.setQueryData(["stories", session?.user?.id], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((userStories) => ({
          ...userStories,
          stories: userStories.stories.map((story) =>
            story.id === variables.storyId
              ? { ...story, isViewed: true }
              : story
          ),
        }));
      });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries(["stories"]);
    },
  });

  return {
    stories,
    isLoading,
    error,
    refetch,
    viewStory: viewStoryMutation.mutate,
    createStory: createStoryMutation.mutate,
    isViewingStory: viewStoryMutation.isPending,
    isCreatingStory: createStoryMutation.isPending,
  };
};

export const useStoryViewer = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const nextStory = useCallback(
    (stories) => {
      const currentUser = stories[currentUserIndex];
      if (!currentUser) return;

      if (currentStoryIndex < currentUser.stories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
        setProgress(0);
      } else {
        // Move to next user
        if (currentUserIndex < stories.length - 1) {
          setCurrentUserIndex((prev) => prev + 1);
          setCurrentStoryIndex(0);
          setProgress(0);
        }
      }
    },
    [currentUserIndex, currentStoryIndex]
  );

  const previousStory = useCallback(
    (stories) => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex((prev) => prev - 1);
        setProgress(0);
      } else if (currentUserIndex > 0) {
        setCurrentUserIndex((prev) => prev - 1);
        const prevUser = stories[currentUserIndex - 1];
        setCurrentStoryIndex(prevUser.stories.length - 1);
        setProgress(0);
      }
    },
    [currentUserIndex, currentStoryIndex]
  );

  const nextUser = useCallback(
    (stories) => {
      if (currentUserIndex < stories.length - 1) {
        setCurrentUserIndex((prev) => prev + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      }
    },
    [currentUserIndex]
  );

  const previousUser = useCallback(() => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  }, [currentUserIndex]);

  const reset = useCallback(() => {
    setCurrentUserIndex(0);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  return {
    currentUserIndex,
    currentStoryIndex,
    isPlaying,
    progress,
    setIsPlaying,
    setProgress,
    nextStory,
    previousStory,
    nextUser,
    previousUser,
    reset,
    setCurrentUserIndex,
    setCurrentStoryIndex,
  };
};
