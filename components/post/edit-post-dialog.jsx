"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { useUpdatePost } from "hooks/use-post-mutation";
import { toast } from "sonner";

export function EditPostDialog({ open, onOpenChange, post, userId }) {
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content);

  const updatePostMutation = useUpdatePost();

  useEffect(() => {
    if (open) {
      setTitle(post.title || "");
      setContent(post.content);
    }
  }, [open, post]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      await updatePostMutation.mutateAsync({
        postId: post.id,
        data: {
          title: title.trim() || undefined,
          content: content.trim(),
          media: post.media, // Keep existing media for now
        },
        userId,
      });

      onOpenChange(false);
      toast.success("Post updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update post"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle>Edit post</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Post title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold placeholder:text-muted-foreground focus-visible:ring-0"
          />

          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] border-0 text-lg placeholder:text-muted-foreground resize-none focus-visible:ring-0"
          />

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
