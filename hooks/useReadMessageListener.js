import { useEffect } from "react";
import socket from "@lib/socket";
import useSidebarConversations from "zustand/useSidebarConversations";
import useConversation from "zustand/useConversation";

const useReadReceiptListener = () => {
  const { markLastMessageAsRead } = useSidebarConversations(); // 🔧 we'll define this below
  const { selectedConversation, messages, setMessages } = useConversation();

  useEffect(() => {
    socket.on("messageRead", ({ conversationId, readerId }) => {
      // ✅ Mark the last message in conversation as read
      markLastMessageAsRead(conversationId);

      // ✅ Also update in open DM if it’s selected
      if (selectedConversation?.conversationId === conversationId) {
        const updated = messages.map((msg) => {
          if (
            msg.senderId !== readerId && // from the other user
            msg.conversationId === conversationId &&
            !msg.isRead // only update if not already read
          ) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
        setMessages(updated);
      }
    });

    return () => {
      socket.off("messageRead");
    };
  }, [selectedConversation, messages, setMessages]);
};

export default useReadReceiptListener;
