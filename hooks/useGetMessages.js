import { useEffect, useState, useCallback } from "react";
import useConversation from "../zustand/useConversation";
import { getMessagesOfUsers } from "@lib/actions/Chat.prisma";
import { useSession } from "next-auth/react";
import { getMessagesFromDB, saveMessagesToDB } from "@lib/indexedDB";

const MESSAGES_PER_PAGE = 50;

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { data: session } = useSession();

  // Initial load of messages
  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversation) return;

      setLoading(true);
      setCursor(null);
      setHasMore(false);

      // Step 1: Check IndexedDB first for instant display
      const cachedMessages = await getMessagesFromDB(
        session?.user.id,
        selectedConversation.id
      );
      if (cachedMessages?.length > 0) {
        setMessages(cachedMessages);
      }

      if (navigator.onLine) {
        try {
          // Step 2: Fetch latest messages from server
          const result = await getMessagesOfUsers(
            selectedConversation.id,
            session?.user.id,
            null,
            MESSAGES_PER_PAGE
          );

          if (result.messages?.length > 0) {
            setMessages(result.messages);
            setHasMore(result.hasMore);
            setCursor(result.nextCursor);

            // Cache messages
            await saveMessagesToDB(
              selectedConversation.id,
              session?.user.id,
              result.messages
            );
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }

      setLoading(false);
    };

    getMessages();
  }, [selectedConversation, session?.user.id, setMessages]);

  // Load more messages (older messages)
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || !hasMore || loadingMore || !cursor) return;

    setLoadingMore(true);

    try {
      const result = await getMessagesOfUsers(
        selectedConversation.id,
        session?.user.id,
        cursor,
        MESSAGES_PER_PAGE
      );

      if (result.messages?.length > 0) {
        // Prepend older messages to the beginning
        setMessages((prev) => [...result.messages, ...prev]);
        setHasMore(result.hasMore);
        setCursor(result.nextCursor);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    }

    setLoadingMore(false);
  }, [selectedConversation, session?.user.id, hasMore, loadingMore, cursor, setMessages]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages
  };
};

export default useGetMessages;
