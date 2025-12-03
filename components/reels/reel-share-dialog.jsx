"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Copy,
  Check,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Link2,
} from "lucide-react";
import { cn } from "@lib/utils";
import { shareReel } from "@lib/actions/reels";

export function ReelShareDialog({ open, onOpenChange, reel, currentUserId }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/reels/${reel.id}`
      : "";

  const trackShare = (platform) => {
    if (currentUserId) {
      startTransition(() => {
        shareReel(reel.id, currentUserId, platform);
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackShare("copy_link");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500",
      onClick: () => {
        trackShare("whatsapp");
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500",
      onClick: () => {
        trackShare("telegram");
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-black",
      onClick: () => {
        trackShare("twitter");
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      onClick: () => {
        trackShare("facebook");
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this reel</DialogTitle>
        </DialogHeader>

        {/* Share options */}
        <div className="grid grid-cols-4 gap-4 py-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110",
                  option.color
                )}
              >
                <option.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-muted-foreground">
                {option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <Input
              value={shareUrl}
              readOnly
              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
            />
          </div>
          <Button onClick={handleCopy} variant="secondary" size="sm">
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
