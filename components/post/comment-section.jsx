"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useComments, useCreateComment } from "hooks/use-comments";
import { Skeleton } from "@components/ui/skeleton";

export function CommentSection({ postId, userId }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: comments, isLoading, error } = useComments(postId);
  const createCommentMutation = useCreateComment();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    try {
      await createCommentMutation.mutateAsync({
        content: newComment,
        postId,
        creatorId: userId,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyContent.trim() || !userId) return;

    try {
      await createCommentMutation.mutateAsync({
        content: replyContent,
        postId,
        creatorId: userId,
        parentCommentId,
      });
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4 border-t">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Failed to load comments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Comment Form */}
      {userId && (
        <form onSubmit={handleSubmitComment} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              <Send className="h-3 w-3 mr-1" />
              Comment
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.creator.picture || undefined} />
                <AvatarFallback>
                  {comment.creator.name?.[0] || comment.creator.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-sm">
                      {comment.creator.name || comment.creator.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </Button>
              </div>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && userId && (
              <div className="ml-11 flex space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
                <form
                  onSubmit={(e) => handleSubmitReply(e, comment.id)}
                  className="flex-1 space-y-2"
                >
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        !replyContent.trim() || createCommentMutation.isPending
                      }
                    >
                      Reply
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-11 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.creator.picture || undefined} />
                      <AvatarFallback className="text-xs">
                        {reply.creator.name?.[0] || reply.creator.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-xs">
                            {reply.creator.name || reply.creator.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {comments?.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
}
