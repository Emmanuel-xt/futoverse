"use client";

import Image from "next/image";
import { cn } from "@lib/utils";

const StoryItem = ({ userStories, onClick }) => {
  const { user, stories } = userStories;
  const hasUnviewedStories = stories.some((story) => !story.isViewed);
  const latestStory = stories[stories.length - 1];

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          "w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-200",
          hasUnviewedStories ? "border-blue-500 shadow-lg" : "border-gray-300"
        )}
      >
        <Image
          src={user?.picture || "/images/noProfile.png"}
          alt={user?.name || "User"}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Story indicator */}
      {/* {hasUnviewedStories && (
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-pulse" />
      )} */}

      <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">
        {user?.name || "Unknown"}
      </p>
    </div>
  );
};

export default StoryItem;
