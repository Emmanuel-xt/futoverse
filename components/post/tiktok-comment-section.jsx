"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  AtSign,
  Smile,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useComments, useCreateComment } from "hooks/use-comments";
import { Skeleton } from "@components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { toast } from "sonner";
import { useDeleteComment, useUpdateComment } from "hooks/use-post-mutation";
import { cn } from "@lib/utils";

export function TikTokCommentSection({ postId, userId }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [likedComments, setLikedComments] = useState(new Set());

  const { data: comments, isLoading, error } = useComments(postId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleLikeComment = (commentId) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleEditComment = (commentId, currentContent) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim() || !userId) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        content: editContent.trim(),
        userId,
      });
      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userId) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        userId,
      });
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

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
      <div className="bg-black text-white min-h-[400px] p-4 space-y-4">
        <div className="text-center text-lg font-semibold mb-4">
          Loading comments...
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-full bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-[400px] p-4 flex items-center justify-center">
        <p className="text-gray-400">Failed to load comments.</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold">
          {comments?.length || 0} comments
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-800"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
        {comments?.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.creator.picture || undefined} />
                <AvatarFallback className="bg-gray-700 text-white text-xs">
                  {comment.creator.name?.[0] || comment.creator.username[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-sm text-white truncate">
                        {comment.creator.name || comment.creator.username}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: false,
                        }).replace("about ", "")}
                      </p>
                    </div>

                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white text-sm min-h-[60px]"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={
                              !editContent.trim() ||
                              updateCommentMutation.isPending
                            }
                            className="bg-white text-black hover:bg-gray-200"
                          >
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent("");
                            }}
                            className="text-gray-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-white leading-relaxed mb-2">
                          {comment.content}
                        </p>

                        {comment.creator.id === userId && (
                          <p className="text-xs text-gray-500 mb-2">
                            Liked by creator
                          </p>
                        )}

                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white text-xs p-0 h-auto"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            Reply
                          </Button>

                          {comment.replies.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white text-xs p-0 h-auto"
                            >
                              View replies ({comment.replies.length})
                            </Button>
                          )}

                          {userId === comment.creator.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-white text-xs p-0 h-auto"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditComment(
                                      comment.id,
                                      comment.content
                                    )
                                  }
                                  className="text-white hover:bg-gray-700"
                                >
                                  <Edit2 className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-red-400 hover:bg-gray-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 p-0",
                        likedComments.has(comment.id)
                          ? "text-red-500 hover:text-red-400"
                          : "text-gray-400 hover:text-white"
                      )}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          likedComments.has(comment.id) && "fill-current"
                        )}
                      />
                    </Button>
                    <span className="text-xs text-gray-400">
                      {Math.floor(Math.random() * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && userId && (
              <div className="ml-11 flex space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                <form
                  onSubmit={(e) => handleSubmitReply(e, comment.id)}
                  className="flex-1 space-y-2"
                >
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-sm min-h-[60px]"
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        !replyContent.trim() || createCommentMutation.isPending
                      }
                      className="bg-white text-black hover:bg-gray-200"
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
                      className="text-gray-400 hover:text-white"
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
                      <AvatarFallback className="bg-gray-700 text-white text-xs">
                        {reply.creator.name?.[0] || reply.creator.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-xs text-white">
                          {reply.creator.name || reply.creator.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(reply.createdAt), {
                            addSuffix: false,
                          }).replace("about ", "")}
                        </p>
                      </div>
                      <p className="text-xs text-white">{reply.content}</p>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-gray-400">
                        {Math.floor(Math.random() * 50)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      {userId && (
        <div className="border-t border-gray-800 p-4">
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center space-x-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-orange-500 text-white text-sm">
                V
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Add comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-transparent border-0 text-white placeholder:text-gray-400 resize-none min-h-[40px] pr-20 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
