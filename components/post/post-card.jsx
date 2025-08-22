"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { useLikeMutation, useTrackView } from "hooks/use-posts";
import { MediaCarousel } from "./media-carousel";
import { ShareDialog } from "./share-dialog";
import { cn } from "@lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { EditPostDialog } from "./edit-post-dialog";
import { DeletePostDialog } from "./delete-post-dialog.jsx";
import Link from "next/link";
import { CommentDrawer } from "./comment-drawer";

import Linkify from "linkify-react";
// import "linkify-plugin-url"; // optional if you want to handle URLs only

const linkifyOptions = {
  target: "_blank",
  rel: "noopener noreferrer",
  className: "text-blue-600 underline break-all",
};

export function PostCard({ post, userId }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);

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
        title: post.title || "Campus Post",
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
          console.warn("Failed to fetch post image for sharing:", error);
          // fallback silently
        }
      }

      await navigator.share(shareData);
    } catch (error) {
      setShowShareDialog(true);
    }
  };

  const shouldTruncate = post.content.length > 300;
  const displayContent =
    shouldTruncate && !showFullContent
      ? post.content.slice(0, 300) + "..."
      : post.content;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.creator.username}`}
            className="flex items-center space-x-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.creator.picture || undefined} />
              <AvatarFallback>
                {post.creator.name?.[0] || post.creator.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all overflow-hidden">
                  {" "}
                  {post.creator.name || post.creator.username}
                </p>
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
          {userId === post.creator.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <>
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
                {/* <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report post
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && <h3 className="font-semibold text-lg">{post.title}</h3>}

        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            <Linkify options={linkifyOptions}>{displayContent}</Linkify>
          </p>
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? "See less" : "See more"}
            </Button>
          )}
        </div>

        {post.media.length > 0 && <MediaCarousel media={post.media} />}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              post.isLiked && "text-red-500"
            )}
            onClick={handleLike}
            disabled={!userId || likeMutation.isPending}
          >
            <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
            <div className="">
              <span>{post._count.likes.toLocaleString()} </span>
              <span>Like{post._count.likes > 1 && "s"}</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setShowCommentDrawer(true)}
          >
            <MessageCircle className="h-4 w-4" />
            <div className="">
              <span>{post._count.comments.toLocaleString()} </span>
              <span>Comment{post._count.comments > 1 && "s"}</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        post={post}
      />

      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        post={post}
        userId={userId}
      />

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        post={post}
        userId={userId}
      />
      <CommentDrawer
        isOpen={showCommentDrawer}
        onClose={() => setShowCommentDrawer(false)}
        postId={post.id}
        userId={userId}
      />
    </Card>
  );
}
