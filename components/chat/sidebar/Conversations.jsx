"use client";

import { useEffect, useState } from "react";
import useGetConversations from "hooks/useGetConversations";
import ConversationItem from "./ConversationItem";
import { Loader2 } from "lucide-react";

// interface ConversationsProps {
//   searchQuery: string
// }

const Conversations = ({ searchQuery }) => {
  const { conversations, loading } = useGetConversations();
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium mb-2">No chats yet</h3>
        <p className="text-sm text-center px-8">
          Start a conversation by tapping the + button above
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {filteredConversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
};

export default Conversations;
