"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import Link from "next/link";

export function ReelUserInfo({
  user,
  caption,
  hashtags,
  createdAt,
  className,
  compact = false,
}) {
  const timeAgo = (date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return "now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Avatar className="w-8 h-8 border-2 border-white">
          <AvatarImage
            src={user.picture || undefined}
            alt={user.name || user.username}
          />
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-white drop-shadow-lg">
            {user.username}
          </span>
          {user.department && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-0"
            >
              {user.department.initial || user.department.name.substring(0, 3)}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-white", className)}>
      {/* User info row */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="w-11 h-11 ring-2 ring-white/80 ring-offset-2 ring-offset-transparent">
            <AvatarImage
              src={user.picture || undefined}
              alt={user.name || user.username}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${user.username}`}
              className="font-bold hover:underline"
            >
              {user.username}
            </Link>
            <span className="text-white/60 text-sm">
              • {timeAgo(createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {user.department && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-white/10 text-white/90 border-white/30"
              >
                {user.department.name}
              </Badge>
            )}
            {user.level && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-white/10 text-white/90 border-white/30"
              >
                {user.level.name}
              </Badge>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
        >
          Follow
        </Button>
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm leading-relaxed mb-2 drop-shadow-lg line-clamp-2">
          {caption}
        </p>
      )}

      {/* Hashtags */}
      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.slice(0, 5).map((tag) => (
            <Link
              key={tag}
              href={`/explore?tag=${tag}`}
              className="text-sm text-white/90 hover:text-white transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {hashtags.length > 5 && (
            <span className="text-sm text-white/60">
              +{hashtags.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
