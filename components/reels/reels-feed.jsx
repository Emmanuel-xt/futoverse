"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReelFullCard } from "./reel-full-card";
import { ReelCommentDrawer } from "./reel-comment-drawer";
import { ReelShareDialog } from "./reel-share-dialog";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import Link from "next/link";
import { incrementReelView } from "@lib/actions/reels";

export function ReelsFeed({ reels, initialIndex = 0, currentUserId }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Local cache for viewed reels to prevent duplicate view counts
  const viewedReelsRef = useRef(new Set());

  useEffect(() => {
    const currentReel = reels[currentIndex];
    if (currentReel && !viewedReelsRef.current.has(currentReel.id)) {
      viewedReelsRef.current.add(currentReel.id);
      // Fire and forget - don't await
      incrementReelView(currentReel.id);
    }
  }, [currentIndex, reels]);

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
      } else if (e.key === "Escape") {
        window.history.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  // Mouse wheel handling
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const threshold = 50;

      if (e.deltaY > threshold) {
        goToNext();
      } else if (e.deltaY < -threshold) {
        goToPrevious();
      }
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

  if (!currentReel) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>No reels available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </Link>

      {/* Progress indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5">
        {reels.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === currentIndex
                ? "w-6 bg-white"
                : idx < currentIndex
                  ? "w-2 bg-white/60"
                  : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {reels.length}
        </span>
      </div>

      {/* Navigation arrows (desktop) */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronUp className="w-8 h-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex === reels.length - 1}
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronDown className="w-8 h-8" />
        </Button>
      </div>

      {/* Current reel */}
      <div className="w-full h-full max-w-md mx-auto relative">
        <ReelFullCard
          reel={currentReel}
          isActive={true}
          currentUserId={currentUserId}
          onCommentOpen={() => setShowComments(true)}
          onShare={() => setShowShare(true)}
        />
      </div>

      {/* Swipe hint for mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <div className="flex flex-col items-center text-white/60 text-xs animate-bounce">
          <ChevronUp className="w-4 h-4" />
          <span>Swipe for more</span>
        </div>
      </div>

      {/* Comment drawer */}
      <ReelCommentDrawer
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        reelId={currentReel.id}
        currentUserId={currentUserId}
      />

      {/* Share dialog */}
      <ReelShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        reel={currentReel}
        currentUserId={currentUserId}
      />
    </div>
  );
}
