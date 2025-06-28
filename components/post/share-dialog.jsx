"use client";

import { useState } from "react";
import { Copy, Facebook, Twitter, Linkedin, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

export function ShareDialog({ open, onOpenChange, post }) {
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/posts/${post.id}`;
  const postTitle = post.title || "Campus Post";
  const postDescription = post.content.slice(0, 100) + "...";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToTwitter = () => {
    const text = `${postTitle} - ${postDescription}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      postUrl
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={postUrl} readOnly className="flex-1" />
            <Button
              type="button"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1 h-auto py-3 bg-transparent"
              onClick={shareToFacebook}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1 h-auto py-3 bg-transparent"
              onClick={shareToTwitter}
            >
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center space-y-1 h-auto py-3 bg-transparent"
              onClick={shareToLinkedIn}
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
