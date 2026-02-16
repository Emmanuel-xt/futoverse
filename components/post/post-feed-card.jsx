"use client";

import { useEffect, useState, memo } from "react";
import {
  Heart,
  Share2,
  MoreHorizontal,
  Edit2,
  Trash2,
  MessageCircle,
  Eye,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useLikeMutation, useTrackView } from "hooks/use-posts";
import { ShareDialog } from "./share-dialog";

function formatTimeShort(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

function getHeadingText(post) {
  if (post.title) return post.title;

  const lines = post.content.split("\n").slice(0, 3).join("\n");
  return lines.length > 150 ? lines.slice(0, 150) + "..." : lines;
}

export const PostFeedCard = memo(function PostFeedCard({
  post,
  userId,
  onEdit,
  onDelete,
  onComment,
  // onShare,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const firstImage = post.media?.[0]?.url || post.images?.[0];
  const heading = getHeadingText(post);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const likeMutation = useLikeMutation(userId);
  const trackViewMutation = useTrackView();

  // Track view when post comes into view
  useEffect(() => {
    if (!hasTrackedView) {
      trackViewMutation.mutate({ postId: post.id, userId });
      setHasTrackedView(true);
    }
  }, [post.id, userId, hasTrackedView, trackViewMutation]);

  const handleLike = () => {
    if (!userId) return;
    likeMutation.mutate({ postId: post.id });
  };

  const handleShare = async () => {
    if (!navigator.share) {
      setShowShareDialog(true);
      return;
    }
    try {
      const firstImageUrl = Array.isArray(post.images)
        ? post.images[0]
        : post.image;

      let shareData = {
        title: post.title || "Futoverse Post",
        text: post.content.slice(0, 100) + "...",
        url: `${window.location.origin}/posts/${post.id}`,
      };

      if (firstImageUrl) {
        try {
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "post-image.jpg", { type: blob.type });

          if (navigator.canShare?.({ files: [file] })) {
            shareData = {
              ...shareData,
              files: [file],
            };
          }
        } catch (error) {
          // console.warn("Failed to fetch post image for sharing:", error);
          // fallback silently
        }
      }

      await navigator.share(shareData);
    } catch (error) {
      setShowShareDialog(true);
    }
  };

  return (
    <div className="bg-background text-foreground">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <Link
          href={`/profile/${post.creator.username}`}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={post.creator.picture || undefined} />
            <AvatarFallback>
              {post.creator.name?.[0] || post.creator.username[0]}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium truncate">
            {post.creator.name || post.creator.username}
          </p>
        </Link>

        {userId === post.creator.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(post)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(post)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {firstImage && (
        <Link href={`/posts/${post.id}`} className="w-full">
          <div className="">
            <Image
              src={firstImage || "/placeholder.svg"}
              alt="Post media"
              width={800}
              height={400}
              sizes="(max-width: 640px) 100vw, 800px"
              loading="lazy"
              className="w-full h-auto  max-h-96 object-cover rounded-lg hover:opacity-90 transition-opacity"
            />
          </div>
        </Link>
      )}

      {heading && (
        <Link href={`/posts/${post.id}`} className="block px-4 pt-3 pb-2">
          <h3 className="text-sm font-medium line-clamp-3 hover:opacity-80 transition-opacity">
            {heading}
          </h3>
        </Link>
      )}

      <div className="flex items-center justify-between px-4 py-2   dark:border-gray-800">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimeShort(post.createdAt)}
        </span>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
            onClick={handleLike}
            disabled={!userId || likeMutation.isPending}
          >
            <Heart
              className={`h-4 w-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
          <button
            onClick={() => onComment?.(post)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
            <Eye className="h-4 w-4" />
            <span>{post._count.views || 0}</span>
          </div>

          <ShareDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            post={post}
          />

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onComment?.(post)}>
                Comment
              </DropdownMenuItem>
              <DropdownMenuItem>Save</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </div>
  );
});
