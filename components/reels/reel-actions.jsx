"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { toggleReelLike } from "@lib/actions/reels";

export function ReelActions({
  reelId,
  originalUrl,
  likesCount,
  commentsCount,
  sharesCount,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  orientation = "vertical",
  className,
}) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    // Optimistic update
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    if (currentUserId) {
      startTransition(async () => {
        const result = await toggleReelLike(reelId, currentUserId);
        if (!result.success) {
          // Revert on failure
          setLiked(liked);
          setLikes(likesCount);
        }
      });
    }

    onLike?.();
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const actionItems = [
    {
      icon: Heart,
      count: likes,
      active: liked,
      onClick: handleLike,
      activeClass: "text-red-500 fill-red-500",
      label: "Like",
    },
    {
      icon: MessageCircle,
      count: commentsCount,
      active: false,
      onClick: onComment,
      activeClass: "",
      label: "Comment",
    },
    {
      icon: Share2,
      count: sharesCount,
      active: false,
      onClick: onShare,
      activeClass: "",
      label: "Share",
    },
    {
      icon: Bookmark,
      count: null,
      active: saved,
      onClick: handleSave,
      activeClass: "text-yellow-500 fill-yellow-500",
      label: "Save",
    },
  ];

  return (
    <div
      className={cn(
        "flex gap-4",
        orientation === "vertical"
          ? "flex-col items-center"
          : "flex-row items-center",
        className
      )}
    >
      {actionItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={cn(
              "p-2 rounded-full bg-black/20 backdrop-blur-sm transition-all group-hover:scale-110 group-active:scale-95",
              orientation === "vertical" ? "p-3" : "p-2"
            )}
          >
            <item.icon
              className={cn(
                "transition-colors",
                orientation === "vertical" ? "w-7 h-7" : "w-5 h-5",
                item.active ? item.activeClass : "text-white"
              )}
            />
          </div>
          {item.count !== null && (
            <span className="text-xs text-white font-medium drop-shadow-lg">
              {formatCount(item.count)}
            </span>
          )}
        </button>
      ))}

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:scale-110 transition-transform">
            <MoreHorizontal
              className={cn(
                "text-white",
                orientation === "vertical" ? "w-7 h-7" : "w-5 h-5"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => window.open(originalUrl, "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Original
          </DropdownMenuItem>
          <DropdownMenuItem>Report</DropdownMenuItem>
          <DropdownMenuItem>Not Interested</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
