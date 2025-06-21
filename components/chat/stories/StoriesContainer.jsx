"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useStories } from "hooks/useStories";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserStories } from "@lib/actions/status.prisma";
import StoryItem from "./StoryItem";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";

const StoriesContainer = () => {
  const { data: session } = useSession();
  const { stories, isLoading } = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get current user's stories
  const { data: currentUserStories = [] } = useQuery({
    queryKey: ["currentUserStories", session?.user?.id],
    queryFn: () => getCurrentUserStories(Number(session?.user?.id)),
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    // retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex space-x-3 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const handleStoryClick = (index) => {
    console.log("Selected story set to ", index);
    setSelectedStoryIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedStoryIndex(null);
  };

  const handleCurrentUserStoryClick = () => {
    if (currentUserStories.length > 0) {
      // View own stories
      setSelectedStoryIndex(-1); // Special index for current user
      setShowCreateModal(true);
    } else {
      // Create new story
      setShowCreateModal(true);
    }
  };

  return (
    <>
      <div className="flex space-x-3 p-4 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        {/* Current user's story */}
        <div className="flex-shrink-0">
          <div className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
              <Image
                src={session?.user?.image || "/images/noProfile.png"}
                alt="Your story"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            {currentUserStories.length === 0 ? (
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                onClick={handleCurrentUserStoryClick}
              >
                <Plus className="w-3 h-3 text-white" />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-blue-500" />
                <div
                  className="absolute bottom-3 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                  onClick={handleCurrentUserStoryClick}
                >
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </>
            )}
            <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">
              {currentUserStories.length > 0 ? "Your story" : "Add story"}
            </p>
          </div>
        </div>

        {/* Friends' stories */}
        {stories.map((userStories, index) => (
          <div key={userStories.user?.id} className="flex-shrink-0">
            <StoryItem
              userStories={userStories}
              onClick={() => handleStoryClick(index)}
            />
          </div>
        ))}
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={
            selectedStoryIndex === -1
              ? [{ user: session?.user, stories: currentUserStories }]
              : stories
          }
          initialUserIndex={selectedStoryIndex === -1 ? 0 : selectedStoryIndex}
          onClose={handleCloseViewer}
          isOwnStory={selectedStoryIndex === -1}
        />
      )}

      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};

export default StoriesContainer;
