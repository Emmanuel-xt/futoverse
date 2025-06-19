"use client";

import { useState } from "react";
import { Search, Plus, Users } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import Conversations from "./Conversations";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import TypingListener from "./TypingListener";

const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="text-white p-4" style={{ backgroundColor: "#2D75FB" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20">
              <Image
                src={session?.user?.image || "/images/noProfile.png"}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Chats</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              onClick={() => setShowNewGroup(true)}
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              onClick={() => setShowNewChat(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500"
          />
        </div>
      </div>

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
