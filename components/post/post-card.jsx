"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { useLikeMutation, useTrackView } from "hooks/use-posts";
import { MediaCarousel } from "./media-carousel";
import { CommentSection } from "./comment-section";
import { ShareDialog } from "./share-dialog";
import { cn } from "@lib/utils";

export function PostCard({ post, userId }) {
  const [showComments, setShowComments] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "Campus Post",
          text: post.content.slice(0, 100) + "...",
          url: `${window.location.origin}/posts/${post.id}`,
        });
      } catch (error) {
        setShowShareDialog(true);
      }
    } else {
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
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.creator.picture || undefined} />
              <AvatarFallback>
                {post.creator.name?.[0] || post.creator.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-sm">
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
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && <h3 className="font-semibold text-lg">{post.title}</h3>}

        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayContent}
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
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{post._count.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>{post._count.likes.toLocaleString()} likes</span>
            <span>{post._count.comments.toLocaleString()} comments</span>
          </div>
        </div>

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
            <span>Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
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

        {showComments && <CommentSection postId={post.id} userId={userId} />}
      </CardContent>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        post={post}
      />
    </Card>
  );
}
