"use client";

import { useState } from "react";
import { ReelEmbedPlayer } from "./reel-embed-player";
import { ReelActions } from "./reel-actions";
import { ReelUserInfo } from "./reel-user-info";
import { cn } from "@lib/utils";
import { toggleReelLike } from "@lib/actions/reels";

export function ReelFullCard({
  reel,
  isActive,
  isMuted,
  currentUserId,
  onCommentOpen,
  onShare,
  className,
}) {
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [likesCount, setLikesCount] = useState(reel.likesCount);

  const handleLike = async () => {
    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    if (currentUserId) {
      const result = await toggleReelLike(reel.id, currentUserId);
      if (!result.success) {
        // Revert on failure
        setIsLiked(!newLikedState);
        setLikesCount(reel.likesCount);
      }
    }
  };

  return (
    <div
      className={cn("relative w-full h-full snap-start snap-always", className)}
    >
      {/* Video embed container */}
      <div className="absolute inset-0 bg-black">
        <ReelEmbedPlayer
          embedUrl={reel.embedUrl}
          platform={reel.platform}
          thumbnailUrl={reel.thumbnailUrl}
          isActive={isActive}
          isMuted={isMuted}
          tiktokEmbedHtml={reel.tiktokEmbedHtml}
          className="w-full h-full"
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-3 bottom-32 z-20">
        <ReelActions
          reelId={reel.id}
          originalUrl={reel.originalUrl}
          likesCount={likesCount}
          commentsCount={reel.commentsCount}
          sharesCount={reel.sharesCount}
          isLiked={isLiked}
          currentUserId={currentUserId}
          onLike={handleLike}
          onComment={onCommentOpen}
          onShare={onShare}
          orientation="vertical"
        />
      </div>

      {/* Bottom user info */}
      <div className="absolute left-4 right-20 bottom-8  z-50">
        <ReelUserInfo
          user={reel.postedBy}
          caption={reel.caption}
          hashtags={reel.hashtags}
          createdAt={reel.createdAt}
        />
      </div>

      {/* View count indicator */}
      <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
        <span className="text-white text-xs font-medium">
          {reel.viewCount.toLocaleString()} views
        </span>
      </div>
    </div>
  );
}
