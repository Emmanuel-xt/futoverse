import { useEffect } from "react";
import socket from "@lib/socket";
import useConversation from "zustand/useConversation";
import { saveMessagesToDB } from "@lib/indexedDB";
import { useSession } from "next-auth/react";
import useSidebarConversations from "zustand/useSidebarConversations";
import { markMessagesAsRead } from "@lib/actions/message.prisma";

const useListenMessages = () => {
  const { messages, setMessages, selectedConversation } = useConversation();
  const { data: session } = useSession();

  const { updateConversations, markLastMessageAsRead } =
    useSidebarConversations();

  useEffect(() => {
    socket.on("newMessage", async (newMessage) => {
      const senderId = newMessage?.message.senderId;
      const conversationId = newMessage?.message.conversationId;
      const userId = session?.user?.id;

      const isCurrentConversation = selectedConversation?.id === senderId;

      // update the conversations list to take latest message to the top
      updateConversations(newMessage);

      if (!isCurrentConversation) return;

      // Update only messages state for currently selected conversation
      const updatedMessages = [...messages, newMessage.message];
      setMessages(updatedMessages);

      await markMessagesAsRead(conversationId, userId);
      // console

      socket.emit("messageRead", {
        conversationId,
        senderId,
        readerId: userId,
      });
      // console.log("Emmitted markRead");

      // ✅ Update the reader’s own sidebar UI
      markLastMessageAsRead(conversationId);

      await saveMessagesToDB(conversationId, userId, updatedMessages);

      // Optionally play sound here too if you want
      const sound = new Audio("/sounds/notification.mp3");
      // sound.play();
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, messages, setMessages, selectedConversation, session]);
};

export default useListenMessages;
