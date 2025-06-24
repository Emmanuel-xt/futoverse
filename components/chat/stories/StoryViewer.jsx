"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Heart,
  Pause,
  Play,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useStories, useStoryViewer } from "hooks/useStories";
import { cn } from "lib/utils";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { replyToStory } from "@lib/actions/status.prisma";
import StoryViewersDrawer from "./StoryViewersModal";

const STORY_DURATION = 5000; // 20 seconds per story

const StoryViewer = ({
  stories,
  initialUserIndex = 0,
  onClose,
  isOwnStory = false,
}) => {
  const { data: session } = useSession();
  const { viewStory, deleteStory, isDeletingStory } = useStories();
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for managing timers and interactions
  const progressIntervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const startTimeRef = useRef(null);
  const pauseStartTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const hasAdvancedRef = useRef(false); // Prevent double advancement

  const {
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
    goToStory,
    reset,
  } = useStoryViewer();

  // Initialize with the selected user
  useEffect(() => {
    goToStory(initialUserIndex, 0);
    // Reset pause state when initializing
    setIsPaused(false);
    totalPausedTimeRef.current = 0;
    hasAdvancedRef.current = false;
  }, [initialUserIndex, goToStory]);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const storyOwnerId = Number(stories[currentUserIndex]?.user.id);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Pause story
  const pauseStory = useCallback(() => {
    if (!isPaused && isPlaying) {
      setIsPaused(true);
      setIsPlaying(false);
      pauseStartTimeRef.current = Date.now();
      clearTimers();
    }
  }, [isPaused, isPlaying, clearTimers, setIsPlaying]);

  // Resume story
  const resumeStory = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      if (pauseStartTimeRef.current) {
        totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
      }
    }
  }, [isPaused, setIsPlaying]);

  // Auto-progress story with pause support
  useEffect(() => {
    if (!isPlaying || !currentStory || isPaused) {
      clearTimers();
      return;
    }

    // Set start time if not already set
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      hasAdvancedRef.current = false;
    }

    const updateProgress = () => {
      if (hasAdvancedRef.current) return; // Prevent updates after advancement

      const now = Date.now();
      const elapsed = now - startTimeRef.current - totalPausedTimeRef.current;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);

      setProgress(newProgress);

      // Only advance once when progress reaches 100%
      if (newProgress >= 100 && !hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        clearTimers();
        // Small delay to ensure smooth transition
        setTimeout(() => {
          nextStory(stories, onClose);
        }, 50);
      }
    };

    // Update progress immediately
    updateProgress();

    // Set up interval for smooth progress updates (every 100ms for smooth animation)
    // progressIntervalRef.current = setInterval(updateProgress, 100);

    return clearTimers;
  }, [
    currentStory,
    isPlaying,
    isPaused,
    nextStory,
    stories,
    setProgress,
    onClose,
    clearTimers,
  ]);

  // Reset timing when story changes
  useEffect(() => {
    startTimeRef.current = null;
    totalPausedTimeRef.current = 0;
    pauseStartTimeRef.current = null;
    hasAdvancedRef.current = false;
    setIsPaused(false);
  }, [currentUserIndex, currentStoryIndex]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && session?.user?.id && !isOwnStory) {
      viewStory({
        storyId: currentStory.id,
        userId: Number.parseInt(session.user.id),
        storyOwnerId: storyOwnerId,
      });
    }
  }, [currentStory, session?.user?.id, viewStory, isOwnStory, storyOwnerId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          previousStory(stories);
          break;
        case "ArrowRight":
          nextStory(stories, onClose);
          break;
        case "Escape":
          onClose();
          break;
        case " ":
          e.preventDefault();
          if (isPaused) {
            resumeStory();
          } else {
            pauseStory();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isPaused,
    nextStory,
    previousStory,
    stories,
    onClose,
    pauseStory,
    resumeStory,
  ]);

  // Touch handlers for mobile gestures
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    // Pause on touch start
    pauseStory();
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;

    // Resume story
    resumeStory();

    // Swipe detection
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > 50 &&
      deltaTime < 300
    ) {
      if (deltaX > 0) {
        // Swipe right - previous user
        previousUser(stories);
      } else {
        // Swipe left - next user
        nextUser(stories, onClose);
      }
    }

    touchStartRef.current = null;
  };

  const handleStoryClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2;

    if (clickX < centerX) {
      previousStory(stories);
    } else {
      nextStory(stories, onClose);
    }
  };

  const handleMouseDown = () => {
    pauseStory();
  };

  const handleMouseUp = () => {
    resumeStory();
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await replyToStory({
        storyId: currentStory.id,
        message: replyText.trim(),
        userId: Number(session?.user?.id),
        storyOwnerId: storyOwnerId,
      });
    } catch (error) {
      console.error("Error sending reply:", error);
    }
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleDeleteStory = () => {
    if (currentStory && isCurrentUserStory) {
      deleteStory({ storyId: currentStory.id });
      // Move to next story or close if it's the last one
      if (currentUser.stories.length === 1) {
        onClose();
      } else {
        nextStory(stories, onClose);
      }
    }
  };

  const handleViewStoryViewers = () => {
    pauseStory(); // Pause when opening modal
    setShowViewersModal(true);
  };

  const handleCloseViewersModal = () => {
    setShowViewersModal(false);
    resumeStory(); // Resume when closing modal
  };

  const handleReplyInputFocus = () => {
    pauseStory();
  };

  const handleReplyInputBlur = () => {
    if (!showReplyInput) {
      resumeStory();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  if (!currentUser || !currentStory) {
    return null;
  }

  const isCurrentUserStory = currentUser.user?.id === Number(session?.user?.id);

  return (
    <>
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/90" onClick={onClose} />

        {/* Story container */}
        <div
          className="relative w-full max-w-md h-full bg-black flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
            {currentUser.stories.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                onClick={() => goToStory(currentUserIndex, index)}
              >
                <div
                  className={cn(
                    "h-full bg-white transition-all duration-100",
                    index < currentStoryIndex && "w-full",
                    index === currentStoryIndex && "transition-none",
                    index > currentStoryIndex && "w-0"
                  )}
                  style={
                    index === currentStoryIndex
                      ? { width: `${progress}%` }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-12 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={currentUser.user?.picture || "/images/noProfile.png"}
                  alt={currentUser.user?.name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {currentUser.user?.name || "Unknown"}
                </p>
                <p className="text-white/70 text-xs">
                  {new Date(currentStory.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isPaused) {
                    resumeStory();
                  } else {
                    pauseStory();
                  }
                }}
                className="text-white hover:bg-white/20 p-2"
              >
                {isPaused || !isPlaying ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>

              {/* Story options for own stories */}
              {isCurrentUserStory && (
                <DropdownMenu
                  onOpenChange={(open) => {
                    if (open) {
                      pauseStory();
                    } else {
                      resumeStory();
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-black/90 border-white/20"
                  >
                    <DropdownMenuItem
                      onClick={handleViewStoryViewers}
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View viewers ({currentStory.viewCount || 0})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteStory}
                      disabled={isDeletingStory}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete story
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story content */}
          <div
            className="flex-1 relative cursor-pointer select-none"
            onClick={handleStoryClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {currentStory.type === "IMAGE" ? (
              <Image
                src={currentStory.content || "/placeholder.svg"}
                alt="Story"
                fill
                className="object-contain"
                priority
              />
            ) : currentStory.type === "VIDEO" ? (
              <video
                src={currentStory.content}
                className="w-full h-full object-contain"
                autoPlay
                muted
                loop={false}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-8"
                style={{
                  backgroundColor: currentStory.backgroundColor || "#000",
                  color: currentStory.textColor || "#fff",
                }}
              >
                <p className="text-2xl font-medium text-center">
                  {currentStory.content}
                </p>
              </div>
            )}

            {currentStory.caption && (
              <div className="absolute bottom-20 left-4 right-4">
                <p className="text-white text-sm bg-black/50 rounded-lg p-3">
                  {currentStory.caption}
                </p>
              </div>
            )}
          </div>

          {/* Navigation arrows for desktop */}
          <div className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => previousUser(stories)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => nextUser(stories, onClose)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-2"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Reply section - only show for other users' stories */}
          {!isCurrentUserStory && (
            <div className="absolute bottom-4 left-4 right-4 z-10">
              {showReplyInput ? (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply to story..."
                    className="flex-1 bg-transparent border-none text-white placeholder:text-white/70 focus:ring-0"
                    onKeyPress={(e) => e.key === "Enter" && handleReply()}
                    onFocus={handleReplyInputFocus}
                    onBlur={handleReplyInputBlur}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReply}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      pauseStory();
                      setShowReplyInput(true);
                    }}
                    className="text-white hover:bg-white/20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
                  >
                    Send message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Story Viewers Modal */}
      {showViewersModal && currentStory && (
        <StoryViewersDrawer
          storyId={currentStory.id}
          open={showViewersModal}
          onClose={handleCloseViewersModal}
        />
      )}
    </>
  );
};

export default StoryViewer;
