import useTypingStore from "zustand/useTypingStore";
import { useEffect } from "react";
import socket from "@lib/socket";

const TypingListener = () => {
  const setTyping = useTypingStore((s) => s.setTyping);
  const removeTyping = useTypingStore((s) => s.removeTyping);

  useEffect(() => {
    socket.on(
      "userTyping",
      ({ userId, userName, conversationId, isTyping }) => {
        if (isTyping) {
          setTyping(conversationId, { userId, userName });
        } else {
          removeTyping(conversationId);
        }
      }
    );

    return () => {
      socket.off("userTyping");
    };
  }, []);

  return null;
};

export default TypingListener;
