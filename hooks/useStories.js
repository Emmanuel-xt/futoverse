"use client";

import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createStory,
  getStoriesFromFriends,
  markStoryAsViewed,
  deleteStory,
  getStoryViewers,
} from "@lib/actions/status.prisma";
import { useSocket } from "@components/providers/SocketProvider";

export const useStories = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const {
    data: stories = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stories", session?.user?.id],
    queryFn: () => getStoriesFromFriends(Number(session?.user?.id)),
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewStory = (data) => {
      console.log("New story received:", data);
      // Invalidate and refetch stories to get the latest data
      queryClient.invalidateQueries(["stories", session.user.id]);
      queryClient.invalidateQueries(["currentUserStories", session.user.id]);
    };

    const handleStoryDeleted = (data) => {
      console.log("Story deleted:", data);
      // Remove the deleted story from cache
      queryClient.setQueryData(["stories", session.user.id], (oldData) => {
        if (!oldData) return oldData;

        return oldData
          .map((userStories) => ({
            ...userStories,
            stories: userStories.stories.filter(
              (story) => story.id !== data.storyId
            ),
          }))
          .filter((userStories) => userStories.stories.length > 0);
      });

      // Also update current user stories if it's their story
      queryClient.setQueryData(
        ["currentUserStories", session.user.id],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((story) => story.id !== data.storyId);
        }
      );
    };

    const handleStoryViewed = (data) => {
      console.log("Story viewed:", data);
      // Update the story view count in cache
      queryClient.setQueryData(["stories", session.user.id], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((userStories) => ({
          ...userStories,
          stories: userStories.stories.map((story) =>
            story.id === data.storyId
              ? { ...story, viewCount: (story.viewCount || 0) + 1 }
              : story
          ),
        }));
      });
    };

    // Listen for real-time story events
    socket.on("new_story", handleNewStory);
    socket.on("story_deleted", handleStoryDeleted);
    socket.on("story_viewed", handleStoryViewed);

    return () => {
      socket.off("new_story", handleNewStory);
      socket.off("story_deleted", handleStoryDeleted);
      socket.off("story_viewed", handleStoryViewed);
    };
  }, [socket, session?.user?.id, queryClient]);

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

      // Emit socket event for real-time updates
      if (socket && data.wasFirstView) {
        socket.emit("story_viewed", {
          storyId: variables.storyId,
          viewerId: variables.userId,
          storyOwnerId: data.storyOwnerId,
        });
      }
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: createStory,
    onSuccess: (newStory) => {
      // Invalidate and refetch stories
      queryClient.invalidateQueries(["stories"]);
      queryClient.invalidateQueries(["currentUserStories", session?.user?.id]);

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("new_story", {
          story: newStory,
          userId: session?.user?.id,
        });
      }
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: deleteStory,
    onSuccess: (data, variables) => {
      // Update cache immediately
      queryClient.setQueryData(["stories", session?.user?.id], (oldData) => {
        if (!oldData) return oldData;

        return oldData
          .map((userStories) => ({
            ...userStories,
            stories: userStories.stories.filter(
              (story) => story.id !== variables.storyId
            ),
          }))
          .filter((userStories) => userStories.stories.length > 0);
      });

      queryClient.setQueryData(
        ["currentUserStories", session?.user?.id],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((story) => story.id !== variables.storyId);
        }
      );

      // Emit socket event
      if (socket) {
        socket.emit("story_deleted", {
          storyId: variables.storyId,
          userId: session?.user?.id,
        });
      }
    },
  });

  const getStoryViewersQueryFn = (storyId) => {
    return getStoryViewers(storyId);
  };

  const useStoryViewersQuery = (storyId) => {
    return useQuery({
      queryKey: ["storyViewers", storyId],
      queryFn: () => getStoryViewersQueryFn(storyId),
      enabled: !!storyId,
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  };

  return {
    stories,
    isLoading,
    error,
    refetch,
    viewStory: viewStoryMutation.mutate,
    createStory: createStoryMutation.mutate,
    deleteStory: deleteStoryMutation.mutate,
    getStoryViewers: useStoryViewersQuery,
    isViewingStory: viewStoryMutation.isPending,
    isCreatingStory: createStoryMutation.isPending,
    isDeletingStory: deleteStoryMutation.isPending,
  };
};

export const useStoryViewer = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const nextStory = useCallback(
    (stories, onComplete) => {
      const currentUser = stories[currentUserIndex];
      if (!currentUser) {
        onComplete?.();
        return;
      }

      if (currentStoryIndex < currentUser.stories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
        setProgress(0);
      } else {
        // Move to next user
        if (currentUserIndex < stories.length - 1) {
          setCurrentUserIndex((prev) => prev + 1);
          setCurrentStoryIndex(0);
          setProgress(0);
        } else {
          // All stories completed
          onComplete?.();
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
    (stories, onComplete) => {
      if (currentUserIndex < stories.length - 1) {
        setCurrentUserIndex((prev) => prev + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        onComplete?.();
      }
    },
    [currentUserIndex]
  );

  const previousUser = useCallback(
    (stories) => {
      if (currentUserIndex > 0) {
        setCurrentUserIndex((prev) => prev - 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      }
    },
    [currentUserIndex]
  );

  const reset = useCallback(() => {
    setCurrentUserIndex(0);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const goToStory = useCallback((userIndex, storyIndex = 0) => {
    setCurrentUserIndex(userIndex);
    setCurrentStoryIndex(storyIndex);
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
    goToStory,
    setCurrentUserIndex,
    setCurrentStoryIndex,
  };
};
