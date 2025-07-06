"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "components/ui/button";
import { Dialog, DialogContent } from "@components/ui/dialog";
import Image from "next/image";

export function FullscreenImageModal({
  open,
  onOpenChange,
  imageUrl,
  alt = "Fullscreen image",
}) {
  useEffect(() => {
    if (!open) return;

    // Add a history entry when modal opens
    const handlePopState = () => {
      onOpenChange(false);
    };

    // Push a new state when modal opens
    window.history.pushState({ modal: "fullscreen-image" }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open, onOpenChange]);

  const handleClose = () => {
    // Go back in history if we can, otherwise just close
    if (window.history.state?.modal === "fullscreen-image") {
      window.history.back();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={alt}
            fill
            className="object-contain"
            priority
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
