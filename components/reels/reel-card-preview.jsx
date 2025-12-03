"use client";

import { useState } from "react";
import { cn } from "@lib/utils";
import { Play, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

export function ReelCardPreview({ reel, index, className }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const platformBadge = {
    TIKTOK: { bg: "bg-black", label: "🎵" },
    INSTAGRAM: {
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      label: "📸",
    },
    YOUTUBE: { bg: "bg-red-600", label: "▶️" },
    FACEBOOK: { bg: "bg-blue-600", label: "📘" },
  };

  return (
    <Link
      href={`/reels?start=${index}`}
      className={cn(
        "relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer flex-shrink-0",
        "w-32 sm:w-36",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      {reel.thumbnailUrl ? (
        <img
          src={reel.thumbnailUrl || "/placeholder.svg"}
          alt={reel.caption || "Reel preview"}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Platform badge */}
      <div
        className={cn(
          "absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs",
          platformBadge[reel.platform].bg
        )}
      >
        {platformBadge[reel.platform].label}
      </div>

      {/* Play button overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        {/* User info */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-white/20 overflow-hidden">
            {reel.postedBy.picture ? (
              <img
                src={reel.postedBy.picture || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-medium">
                {reel.postedBy.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-white text-xs font-medium truncate">
            {reel.postedBy.username}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-white/80 text-[10px]">
          <span className="flex items-center gap-0.5">
            <Heart className="w-3 h-3" />
            {formatCount(reel.likesCount)}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="w-3 h-3" />
            {formatCount(reel.commentsCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
