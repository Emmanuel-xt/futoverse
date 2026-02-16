"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import Conversations from "./Conversations";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";
import { cn } from "@lib/utils";
import StoriesContainer from "../stories/StoriesContainer";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div
        className="text-white px-4 py-1 bg-primary"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-semibold">Chats</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Collapsible Search */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out",
                isSearchExpanded ? "w-full" : "w-auto"
              )}
            >
              {isSearchExpanded ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={handleSearchBlur}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500"
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2 focus-visible:ring-2 focus-visible:ring-white"
                    onClick={handleSearchClick}
                    aria-label="Search conversations"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2 focus-visible:ring-2 focus-visible:ring-white"
                    onClick={() => setShowNewChat(true)}
                    aria-label="New chat"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stories Container */}
      <StoriesContainer />

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <Conversations searchQuery={searchQuery} />
      </div>

      {/* Modals */}
      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
      <NewGroupModal
        open={showNewGroup}
        onClose={() => setShowNewGroup(false)}
      />
    </div>
  );
};

export default Sidebar;
