"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@lib/utils";
import { Play, Volume2, VolumeX, Loader2 } from "lucide-react";

export function ReelEmbedPlayer({
  embedUrl,
  platform,
  thumbnailUrl,
  isActive = false,
  className,
  tiktokEmbedHtml,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(!isActive);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef(null);
  const tiktokContainerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setShowThumbnail(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (
      platform === "TIKTOK" &&
      tiktokEmbedHtml &&
      isActive &&
      !showThumbnail
    ) {
      // Load TikTok embed script

      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      setIsLoading(false);
    }
  }, [platform, tiktokEmbedHtml, isActive, showThumbnail]);

  const handlePlay = () => {
    setShowThumbnail(false);
  };

  const getEmbedParams = () => {
    switch (platform) {
      case "YOUTUBE":
        return `${embedUrl}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playsinline=1&controls=0&modestbranding=1`;
      case "INSTAGRAM":
        return embedUrl;
      case "FACEBOOK":
        return `${embedUrl}&autoplay=${isActive}`;
      default:
        return embedUrl;
    }
  };

  const renderTikTokEmbed = () => {
    if (!tiktokEmbedHtml) {
      // Fallback if no HTML provided
      return (
        <div className="flex items-center justify-center h-full bg-black/90 text-white text-center p-4">
          <div>
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-lg font-medium mb-2">TikTok Video</p>
            <p className="text-sm text-white/70">Open in TikTok to view</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        {/* TikTok embed HTML */}
        <div
          ref={tiktokContainerRef}
          className="w-full h-full flex items-center justify-center bg-black"
          dangerouslySetInnerHTML={{ __html: tiktokEmbedHtml }}
        />

        {/* White overlay at bottom */}
        <div
          className="
      absolute bottom-0 left-0 right-0 
      h-44
       bg-black
      pointer-events-none
      z-50
    "
        />
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative w-full h-full bg-black rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Loading state */}
      {isLoading && !showThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Thumbnail overlay */}
      {showThumbnail && thumbnailUrl && (
        <div
          className="absolute inset-0 z-20 cursor-pointer group"
          onClick={handlePlay}
        >
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      {(!showThumbnail || !thumbnailUrl) && (
        <>
          {platform === "TIKTOK" ? (
            renderTikTokEmbed()
          ) : (
            <iframe
              ref={iframeRef}
              src={getEmbedParams()}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          )}
        </>
      )}

      {/* Mute toggle for active embeds */}
      {isActive && !showThumbnail && platform === "YOUTUBE" && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Platform badge */}
      <div
        className={cn(
          "absolute top-3 left-3 z-30 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          platform === "TIKTOK" && "bg-black text-white border border-white/20",
          platform === "INSTAGRAM" &&
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
          platform === "YOUTUBE" && "bg-red-600 text-white",
          platform === "FACEBOOK" && "bg-blue-600 text-white"
        )}
      >
        {platform === "TIKTOK" && (
          <>
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            TikTok
          </>
        )}
        {platform === "INSTAGRAM" && "Instagram"}
        {platform === "YOUTUBE" && "YouTube"}
        {platform === "FACEBOOK" && "Facebook"}
      </div>
    </div>
  );
}
