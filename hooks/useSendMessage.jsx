import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { sendMessageToUser } from "@lib/actions/Chat.prisma";
import socket from "@components/socket/Socket";
import useSidebarConversations from "zustand/useSidebarConversations"; // ✅

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { data: session } = useSession();

  const { updateConversations } = useSidebarConversations(); // ✅

  const sendMessage = async (message) => {
    if (!selectedConversation) return;
    setLoading(true);
    try {
      const data = await sendMessageToUser({
        message: message,
        receiverId: selectedConversation.id,
        senderId: session.user.id,
      });

      // Emit the event to send a private message.
      socket.emit("private_message", {
        receiverId: selectedConversation.id,
        message: data,
      });

      // ✅ Update messages UI immediately
      setMessages([...messages, data]);

      console.log("data from server", data);
      // ✅ Raise conversation to the top

      const newMessage = {
        message: data,
      };
      updateConversations(newMessage);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};
export default useSendMessage;
