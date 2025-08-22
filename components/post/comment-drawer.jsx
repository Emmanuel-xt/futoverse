"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  MessageCircle,
  Edit2,
  Trash2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Skeleton } from "@components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { ScrollArea } from "@components/ui/scroll-area";
import { useComments, useCreateComment } from "hooks/use-comments";
import { useDeleteComment, useUpdateComment } from "hooks/use-post-mutation";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@components/ui/input";
import { AutoResizeTextarea } from "./auto-resize-textarea";

export function CommentDrawer({ isOpen, onClose, postId, userId }) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments, isLoading, error } = useComments(postId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleEditComment = (commentId, content) => {
    setEditingComment(commentId);
    setEditContent(content);
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
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userId) return;
    try {
      await deleteCommentMutation.mutateAsync({ commentId, userId });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
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
    } catch {
      toast.error("Failed to comment");
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim() || !userId) return;
    try {
      await createCommentMutation.mutateAsync({
        content: replyContent,
        postId,
        creatorId: userId,
        parentCommentId: parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
    } catch {
      toast.error("Failed to reply");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments?.length || 0})
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-center text-muted-foreground text-sm">
              Failed to load comments.
            </p>
          )}

          {comments?.map((comment) => (
            <div key={comment.id} className="space-y-2 mb-2">
              {/* Main comment */}
              <div className="flex space-x-1">
                <Link href={`/profile/${comment.creator.username}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.creator.picture} />
                    <AvatarFallback>
                      {comment.creator.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg px-3">
                    <div className="flex justify-between">
                      <Link href={`/profile/${comment.creator.username}`}>
                        <p className="text-sm font-medium">
                          {comment.creator.name}
                        </p>
                        <p className="text-xs text-slate-700 text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </Link>
                      {userId === comment.creator.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditComment(comment.id, comment.content)
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {editingComment === comment.id ? (
                      <>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="mt-2"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-medium whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Reply button */}
                  {userId && editingComment !== comment.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      Reply
                    </Button>
                  )}
                </div>
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="ml-10 mt-2">
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                    <AutoResizeTextarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="border-gray-200 focus:border-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" type="submit">
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
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
              {comment.replies?.length > 0 && (
                <div className="ml-10 space-y-3 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-1">
                      <Link href={`/profile/${reply.creator.username}`}>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.creator.picture} />
                          <AvatarFallback>
                            {reply.creator.name?.[0] ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg px-2">
                          <div className="flex justify-between">
                            <div>
                              <Link href={`/profile/${reply.creator.username}`}>
                                <p className="text-xs font-medium">
                                  {reply.creator.name}
                                </p>
                              </Link>
                              <p className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(reply.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </p>
                            </div>
                            {userId === reply.creator.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditComment(reply.id, reply.content)
                                    }
                                  >
                                    <Edit2 className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteComment(reply.id)
                                    }
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {editingComment === reply.id ? (
                            <>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="mt-2"
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateComment(reply.id)}
                                >
                                  Update
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditContent("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="text-xs mt-2">{reply.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>

        {/* Comment input at bottom */}
        <div className="border-t p-4 bg-background">
          {userId ? (
            <form onSubmit={handleSubmitComment} className="flex space-x-3">
              {/* <Avatar className="h-8 w-8">
                <AvatarImage src={userPicture || undefined} />
                <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
              </Avatar> */}
              <div className="flex-1 space-y-2 space-x-2 flex">
                <AutoResizeTextarea
                  placeholder="Write a comment..."
                  value={newComment}
                  className="border-gray-200 focus:border-blue-500"
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !newComment.trim() || createCommentMutation.isPending
                  }
                >
                  <Send className="h-3 w-3 mr-1" />
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Log in to comment
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
