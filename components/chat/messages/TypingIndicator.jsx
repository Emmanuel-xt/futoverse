"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useConversation from "zustand/useConversation";
import socket from "@lib/socket";

const TypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState([]);
  const { selectedConversation } = useConversation();
  const { data: session } = useSession();

  useEffect(() => {
    if (!selectedConversation) return;

    const handleUserTyping = (data) => {
      if (data.conversationId !== selectedConversation.conversationId) return;
      if (data.userId === Number.parseFloat(session?.user?.id)) return; // Don't show own typing

      setTypingUsers((prev) => {
        if (data.isTyping) {
          const exists = prev.find((user) => user.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, userName: data.userName }];
          }
          return prev;
        } else {
          return prev.filter((user) => user.userId !== data.userId);
        }
      });
    };

    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
    };
  }, [selectedConversation, session]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
