"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Send, Heart, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { getReelComments, addReelComment } from "@lib/actions/reels";

export function ReelCommentDrawer({ isOpen, onClose, reelId, currentUserId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && reelId) {
      setIsLoading(true);
      getReelComments(reelId, { limit: 50 })
        .then((result) => {
          if (result.success && result.data) {
            const transformedComments = result.data.map((c) => ({
              id: c.id,
              content: c.content,
              user: {
                id: c.user.id,
                username: c.user.username,
                name: c.user.name,
                picture: c.user.picture,
              },
              createdAt: c.createdAt.toISOString(),
              likes: 0,
              isLiked: false,
            }));
            setComments(transformedComments);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, reelId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || !currentUserId) return;

    startTransition(async () => {
      const result = await addReelComment({
        reelId,
        userId: currentUserId,
        content: comment,
      });

      if (result.success && result.data) {
        const newComment = {
          id: result.data.id,
          content: result.data.content,
          user: {
            id: result.data.user.id,
            username: result.data.user.username,
            name: result.data.user.name,
            picture: result.data.user.picture,
          },
          createdAt: result.data.createdAt.toISOString(),
          likes: 0,
          isLiked: false,
        };
        setComments([newComment, ...comments]);
        setComment("");
      }
    });
  };

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
    return `${days}d`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl transition-transform duration-300 max-h-[70vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h3 className="font-semibold text-lg">
            Comments ({comments.length})
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={c.user.picture || undefined} />
                  <AvatarFallback>
                    {c.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {c.user.username || c.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{c.content}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Heart
                        className={cn(
                          "w-3.5 h-3.5",
                          c.isLiked && "fill-red-500 text-red-500"
                        )}
                      />
                      {c.likes}
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              currentUserId ? "Add a comment..." : "Login to comment"
            }
            className="flex-1"
            disabled={!currentUserId || isSubmitting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!comment.trim() || !currentUserId || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
