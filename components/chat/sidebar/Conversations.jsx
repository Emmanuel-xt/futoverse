"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import useGetConversations from "hooks/useGetConversations";
import ConversationItem from "./ConversationItem";
import { Loader2 } from "lucide-react";

const Conversations = ({ searchQuery }) => {
  const { conversations, loading } = useGetConversations();
  const parentRef = useRef(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((conv) =>
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Conversation item height
    overscan: 5,
  });

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

  // Only virtualize if there are many conversations
  if (filteredConversations.length < 20) {
    return (
      <div className="overflow-y-auto h-full">
        {filteredConversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    );
  }

  // Virtualized list for many conversations
  return (
    <div ref={parentRef} className="overflow-y-auto h-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const conversation = filteredConversations[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
            >
              <ConversationItem conversation={conversation} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Conversations;
