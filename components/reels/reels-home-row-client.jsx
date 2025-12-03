"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { ReelCardPreview } from "./reel-card-preview";
import { cn } from "@lib/utils";

export function ReelsHomeRowClient({ reels }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (reels.length === 0) return null;

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full shadow-lg transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Reels row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => (
          <ReelCardPreview key={reel.id} reel={reel} index={index} />
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full shadow-lg transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
