import { useEffect } from "react";
import socket from "@components/socket/Socket";
import useConversation from "zustand/useConversation";
import { saveMessagesToDB } from "@lib/indexedDB";
import { useSession } from "next-auth/react";

const useListenMessages = () => {
  const { messages, setMessages, selectedConversation } = useConversation();
  const { data: session } = useSession();

  useEffect(() => {
    socket.on("newMessage", async (newMessage) => {
      console.log("USE LISTENER MESSAGE", newMessage);
      const isCurrentConversation =
        selectedConversation?.conversationId ===
        newMessage?.message.conversationId;

      if (!isCurrentConversation) return;

      // Update only messages state for currently selected conversation
      const updatedMessages = [...messages, newMessage.message];
      setMessages(updatedMessages);

      const senderId = newMessage?.senderId;
      const receiverId = session?.user?.id;

      await saveMessagesToDB(receiverId, senderId, updatedMessages);

      // Optionally play sound here too if you want
      const sound = new Audio("/sounds/notification.mp3");
      sound.play();
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, messages, setMessages, selectedConversation, session]);
};

export default useListenMessages;
