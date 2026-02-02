"use client";

import { useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import useGetMessages from "hooks/useGetMessages";
import Message from "./Message";
import useListenMessages from "hooks/useListenMessages";
import { groupMessagesByDate } from "@constants/functions";
import { Loader2 } from "lucide-react";

const Messages = () => {
  const { loading, loadingMore, messages, hasMore, loadMoreMessages } = useGetMessages();
  useListenMessages();

  const parentRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Flatten grouped messages for virtualization
  const grouped = groupMessagesByDate(messages || []);
  const flattenedItems = [];

  Object.entries(grouped).forEach(([date, msgs]) => {
    // Add date separator
    flattenedItems.push({ type: "date", date, id: `date-${date}` });
    // Add messages
    msgs.forEach((message) => {
      flattenedItems.push({ type: "message", message, id: message.id });
    });
  });

  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flattenedItems[index];
      // Date separators are smaller than messages
      return item?.type === "date" ? 40 : 72;
    },
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (flattenedItems.length > 0 && isInitialLoad.current) {
      // Small delay to ensure virtualizer is ready
      setTimeout(() => {
        virtualizer.scrollToIndex(flattenedItems.length - 1, { align: "end" });
        isInitialLoad.current = false;
      }, 100);
    }
  }, [flattenedItems.length, virtualizer]);

  // Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [messages]);

  // Scroll to bottom when new message arrives (if already near bottom)
  useEffect(() => {
    if (!isInitialLoad.current && flattenedItems.length > 0) {
      const scrollElement = parentRef.current;
      if (scrollElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (isNearBottom) {
          virtualizer.scrollToIndex(flattenedItems.length - 1, { align: "end" });
        }
      }
    }
  }, [flattenedItems.length, virtualizer]);

  // Load more when scrolling to top
  const handleScroll = useCallback(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || loadingMore || !hasMore) return;

    if (scrollElement.scrollTop < 100) {
      loadMoreMessages();
    }
  }, [loadingMore, hasMore, loadMoreMessages]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-center text-gray-400">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="px-4 mb-24 flex-1 overflow-auto z-30"
    >
      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}

      {/* Load more hint */}
      {hasMore && !loadingMore && (
        <div className="text-center py-2">
          <span className="text-xs text-gray-400">Scroll up for older messages</span>
        </div>
      )}

      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = flattenedItems[virtualItem.index];

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
              {item.type === "date" ? (
                <div className="text-center text-xs text-gray-500 my-4">
                  {item.date}
                </div>
              ) : (
                <Message message={item.message} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
