"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@lib/utils";
import { Loader2 } from "lucide-react";

export function ReelEmbedPlayer({
  embedUrl,
  platform,
  thumbnailUrl,
  isActive = false,
  isMuted = true,
  tiktokEmbedHtml,
  className,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const iframeRef = useRef(null);

  // Mark as seen so we don't reload when scrolling back up
  useEffect(() => {
    if (isActive) setHasLoadedOnce(true);
  }, [isActive]);

  // Failsafe: Remove spinner after 2s
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- TIKTOK "PER-VIDEO" INJECTOR ---
  useEffect(() => {
    if (platform === "TIKTOK" && tiktokEmbedHtml) {
      // 1. Stop the spinner immediately
      setIsLoading(false);

      // 2. Create a fresh script tag
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;

      // 3. Callback: Once script loads, force process
      script.onload = () => {
        if (
          window.tiktok &&
          window.tiktok.embed &&
          window.tiktok.embed.process
        ) {
          window.tiktok.embed.process();
        }
      };

      // 4. Inject into body
      document.body.appendChild(script);

      // 5. Cleanup: Optional, but keeps the DOM clean.
      // Note: Removing the script tag doesn't stop the video, it just cleans the HTML.
      return () => {
        // We generally leave it to avoid breaking active players,
        // but if you want "fresh" every time, we can leave it or remove it.
        // Leaving it is safer for playback stability.
      };
    }
  }, [platform, tiktokEmbedHtml]);
  // Runs once when the component mounts (which happens when it enters the buffer)

  const getEmbedParams = () => {
    const muteParam = isMuted ? "1" : "0";
    const autoplayParam = isActive ? "1" : "0";

    switch (platform) {
      case "YOUTUBE":
        return `${embedUrl}?autoplay=${autoplayParam}&mute=${muteParam}&loop=1&playsinline=1&controls=0&modestbranding=1&enablejsapi=1&rel=0`;
      case "FACEBOOK":
        return `${embedUrl}&autoplay=${isActive}&mute=${isMuted}`;
      default:
        return embedUrl;
    }
  };

  const renderTikTokEmbed = () => {
    if (!tiktokEmbedHtml) return null;
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div
          className="w-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: tiktokEmbedHtml }}
        />
        {/* Transparent overlay for swipe detection */}
        <div className="absolute inset-0 pointer-events-none" />
      </div>
    );
  };

  const showIframe = isActive || hasLoadedOnce;

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      {/* Thumbnail */}
      {(!hasLoadedOnce || isLoading) && thumbnailUrl && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover opacity-100"
          />
        </div>
      )}

      {/* Spinner (Non-TikTok) */}
      {isLoading && isActive && platform !== "TIKTOK" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Player */}
      {showIframe && (
        <div className="absolute inset-0 z-0 w-full h-full">
          {platform === "TIKTOK" ? (
            renderTikTokEmbed()
          ) : (
            <iframe
              ref={iframeRef}
              src={getEmbedParams()}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20" />
    </div>
  );
}
