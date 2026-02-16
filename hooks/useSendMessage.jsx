import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { sendMessageToUser } from "@lib/actions/message.prisma";
import socket from "@lib/socket";
import useSidebarConversations from "zustand/useSidebarConversations"; // ✅
import { saveMessagesToDB } from "@lib/indexedDB";

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
        senderId: Number(session.user.id),
      });

      // Emit the event to send a private message.
      socket.emit("private_message", {
        receiverId: selectedConversation.id,
        message: data,
      });

      // ✅ Update messages UI immediately
      const updatedMessages = [...messages, data];
      setMessages(updatedMessages);
      await saveMessagesToDB(
        selectedConversation.id,
        session.user.id,
        updatedMessages
      );

      // console.log("data from server", data);
      // ✅ Raise conversation to the top

      const newMessage = {
        message: data,
      };
      // console.log("New Message ==", newMessage);
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
