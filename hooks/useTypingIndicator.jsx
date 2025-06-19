"use client";

import { useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import useConversation from "zustand/useConversation";
import socket from "@components/socket/Socket";

const useTypingIndicator = () => {
  const { data: session } = useSession();
  const { selectedConversation } = useConversation();
  const typingTimeoutRef = useRef();
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (!selectedConversation || !session?.user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      socket.emit("typing", {
        userId: Number.parseFloat(session.user.id),
        userName: session.user.name,
        conversationId: selectedConversation.conversationId,
        isTyping: false,
      });
      isTypingRef.current = false;
    }
  }, [selectedConversation, session]);

  const startTyping = useCallback(() => {
    if (!selectedConversation || !session?.user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only emit if not already typing
    if (!isTypingRef.current) {
      socket.emit("typing", {
        userId: Number.parseFloat(session.user.id),
        userName: session.user.name,
        conversationId: selectedConversation.conversationId,
        isTyping: true,
      });
      isTypingRef.current = true;
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [selectedConversation, session, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        stopTyping();
      }
    };
  }, [stopTyping]);

  return { startTyping, stopTyping };
};

export default useTypingIndicator;
