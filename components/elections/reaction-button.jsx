"use client";

import { Button } from "@components/ui/button";
import { useState } from "react";
import { toggleReaction } from "@lib/actions/election";
import { useRouter } from "next/navigation";

export function ReactionButton({ candidateId, type, count, label }) {
  const [isReacted, setIsReacted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);
  const router = useRouter();

  const handleReaction = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await toggleReaction(candidateId, type, 1); // TODO: Replace with actual user ID from auth

      if (result.success) {
        const wasAdded = result.data.action === "added";
        setIsReacted(wasAdded);
        setCurrentCount((prev) => (wasAdded ? prev + 1 : prev - 1));
        router.refresh(); // Refresh to sync with server state
      } else {
        console.error("Failed to react:", result.error);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isReacted ? "default" : "outline"}
      size="sm"
      onClick={handleReaction}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <span className="text-lg">{type}</span>
      <span className="text-sm">{currentCount}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Button>
  );
}
