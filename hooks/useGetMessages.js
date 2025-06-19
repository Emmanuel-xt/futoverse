import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import { getMessagesOfUsers } from "@lib/actions/Chat.prisma";
import { useSession } from "next-auth/react";
import { getMessagesFromDB, saveMessagesToDB } from "@lib/indexedDB";
import { toast } from "sonner";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { data: session } = useSession();

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedConversation) return;
      // Step 1: Check IndexedDB first
      const cachedMessages = await getMessagesFromDB(
        session?.user.id,
        selectedConversation.id
      );
      // console.log("Got cached messages", cachedMessages);
      setMessages(cachedMessages);
      // console.log("messages", messages);

      if (navigator.onLine) {
        try {
          // Step 2: Fetch from Prisma and update IndexedDB
          const fetchedMessages = await getMessagesOfUsers(
            selectedConversation.id,
            session?.user.id
          );

          if (fetchedMessages.length > 0) {
            setMessages(fetchedMessages);
            await saveMessagesToDB(
              selectedConversation.id,
              session?.user.id,
              fetchedMessages
            ); // Cache messages
          }
        } catch (error) {
          // toast(error.message);
        }
      }
    };

    getMessages();
  }, [selectedConversation]);

  return { messages, loading };
};

export default useGetMessages;
