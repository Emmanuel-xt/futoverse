"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, FileText, Volume2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { FullscreenImageModal } from "./fullscreen-image-modal";

export function MediaCarousel({ media }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (media.length === 0) return null;

  const currentMedia = media[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const renderMedia = (item) => {
    switch (item.type) {
      case "IMAGE":
        return (
          <div
            className="cursor-pointer"
            onClick={() => setFullscreenImage(item.url)}
          >
            <Image
              src={item.url || "/placeholder.svg"}
              alt="Post media"
              width={600}
              height={400}
              className="w-full h-auto max-h-96 object-cover rounded-lg"
            />
          </div>
        );
      case "VIDEO":
        return (
          <div className="relative">
            <video
              src={item.url}
              controls
              className="w-full h-auto max-h-96 rounded-lg"
              preload="metadata"
            />
          </div>
        );
      case "AUDIO":
        return (
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            <div className="text-center space-y-2">
              <Volume2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <audio src={item.url} controls className="w-full max-w-sm" />
            </div>
          </div>
        );
      case "DOCUMENT":
        return (
          <div className="flex items-center justify-center bg-muted rounded-lg p-8">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Document</p>
              <Button variant="outline" size="sm" asChild>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative">
        {renderMedia(currentMedia)}

        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={prevMedia}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={nextMedia}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {media.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <FullscreenImageModal
        open={!!fullscreenImage}
        onOpenChange={(open) => !open && setFullscreenImage(null)}
        imageUrl={fullscreenImage}
        alt="Post media"
      />
    </>
  );
}
