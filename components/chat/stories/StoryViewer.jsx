"use client";

import { useState, useEffect, useRef } from "react";
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
import StoryViewersModal from "./StoryViewersModal";
import { replyToStory } from "@lib/actions/status.prisma";

const STORY_DURATION = 20000; // 5 seconds per story

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
  const progressIntervalRef = useRef(null);
  const storyTimeoutRef = useRef(null);
  const touchStartRef = useRef(null);

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
  }, [initialUserIndex, goToStory]);
  // console.log("Stories ======", stories);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const storyOwnerId = Number(stories[currentUserIndex]?.user.id);

  // Auto-progress story
  useEffect(() => {
    if (!isPlaying || !currentStory) return;

    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        setProgress(100);
        nextStory(stories, onClose);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    storyTimeoutRef.current = setTimeout(() => {
      nextStory(stories, onClose);
    }, STORY_DURATION);

    return () => {
      clearInterval(progressIntervalRef.current);
      clearTimeout(storyTimeoutRef.current);
    };
  }, [currentStory, isPlaying, nextStory, stories, setProgress, onClose]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && session?.user?.id && !isOwnStory) {
      // console.log("Current story", currentStory);
      viewStory({
        storyId: currentStory.id,
        userId: Number.parseInt(session.user.id),
        storyOwnerId: storyOwnerId, // 👈 pass this!
      });
    }
  }, [currentStory, session?.user?.id, viewStory, isOwnStory]);

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
          setIsPlaying(!isPlaying);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, nextStory, previousStory, stories, onClose, setIsPlaying]);

  // Touch handlers for mobile gestures
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
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
    setIsPlaying(false);
  };

  const handleMouseUp = () => {
    setIsPlaying(true);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    // TODO: Implement reply functionality
    try {
      await replyToStory({
        storyId: currentStory.id,
        message: replyText.trim(),
        userId: Number(session?.user?.id),
        storyOwnerId: storyOwnerId,
      }); // 👈 pass this!);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
    console.log("Reply:", replyText, "to story:", currentStory.id);
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleDeleteStory = () => {
    // console.log("Deleting story:", currentStory.id, isCurrentUserStory);
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
    setShowViewersModal(true);
  };

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
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20 p-2"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Story options for own stories */}
              {isCurrentUserStory && (
                <DropdownMenu>
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
                    onClick={() => setShowReplyInput(true)}
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
        <StoryViewersModal
          storyId={currentStory.id}
          open={showViewersModal}
          onClose={() => setShowViewersModal(false)}
        />
      )}
    </>
  );
};

export default StoryViewer;
