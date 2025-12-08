"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReelFullCard } from "./reel-full-card";
import { ReelCommentDrawer } from "./reel-comment-drawer";
import { ReelShareDialog } from "./reel-share-dialog";
import { ChevronUp, ChevronDown, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import Link from "next/link";
import { incrementReelView } from "@lib/actions/reels";

export function ReelsFeed({ reels, initialIndex = 0, currentUserId }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);

  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const viewedReelsRef = useRef(new Set());

  // Keep this at 2 to ensure the DOM exists before we inject the script
  const PRELOAD_BUFFER = 2;

  useEffect(() => {
    const currentReel = reels[currentIndex];
    if (currentReel && !viewedReelsRef.current.has(currentReel.id)) {
      viewedReelsRef.current.add(currentReel.id);
      incrementReelView(currentReel.id);
    }
  }, [currentIndex, reels]);

  // REMOVED: The global TikTok script loader is gone.
  // We now rely on ReelEmbedPlayer to load it individually.

  const goToNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, reels.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "m") {
        setIsGlobalMuted((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrevious();
    }
  };

  // Wheel handling
  const handleWheel = useCallback(
    (e) => {
      const threshold = 50;
      if (e.deltaY > threshold) goToNext();
      else if (e.deltaY < -threshold) goToPrevious();
    },
    [goToNext, goToPrevious]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  const currentReel = reels[currentIndex];

  if (!currentReel) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 touch-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsGlobalMuted(!isGlobalMuted);
        }}
        className="absolute top-4 right-20 z-50 text-white bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full"
      >
        {isGlobalMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </Button>

      <div className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {reels.length}
        </span>
      </div>

      <div className="relative w-full h-full max-w-md mx-auto">
        {reels.map((reel, index) => {
          const shouldRender = Math.abs(index - currentIndex) <= PRELOAD_BUFFER;
          if (!shouldRender) return null;

          const isVisible = index === currentIndex;
          const offset = (index - currentIndex) * 100;

          return (
            <div
              key={reel.id}
              className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translateY(${offset}%)` }}
            >
              <ReelFullCard
                reel={reel}
                isActive={isVisible}
                isMuted={isGlobalMuted}
                currentUserId={currentUserId}
                onCommentOpen={() => setShowComments(true)}
                onShare={() => setShowShare(true)}
              />
            </div>
          );
        })}
      </div>

      <ReelCommentDrawer
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        reelId={currentReel.id}
        currentUserId={currentUserId}
      />
      <ReelShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        reel={currentReel}
        currentUserId={currentUserId}
      />
    </div>
  );
}
