import { getUsersForSidebar } from "@lib/actions/conversation.prisma";
import { openDatabase } from "@lib/indexedDB";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSidebarConversations from "zustand/useSidebarConversations";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const { conversations, setConversations } = useSidebarConversations();
  const { data: session } = useSession();
  const userId = parseFloat(session?.user.id);

  // Load cached conversations from IndexedDB
  const loadCachedConversations = async () => {
    try {
      const db = await openDatabase();
      if (!db) return [];

      if (!db.objectStoreNames.contains("conversations")) {
        console.warn("Object store not found, skipping cache load.");
        return [];
      }

      const tx = db.transaction("conversations", "readonly");
      const store = tx.objectStore("conversations");
      const cachedData = await store.getAll();
      cachedData.sort((a, b) => a.sortOrder - b.sortOrder);

      // console.log("Loaded cached conversations:", cachedData);
      return cachedData;
    } catch (error) {
      console.error("Error loading cached conversations:", error);
      return [];
    }
  };

  // Save or update conversations in IndexedDB
  const saveConversationsToDB = async (newConversations) => {
    // console.log("About to save cached data ", newConversations);
    try {
      const db = await openDatabase();
      if (!db) return;

      if (!db.objectStoreNames.contains("conversations")) {
        console.warn("Object store missing, skipping save.");
        return;
      }

      const tx = db.transaction("conversations", "readwrite");
      const store = tx.objectStore("conversations");

      // Clear all existing conversations
      await store.clear();

      // Add or overwrite all new conversations
      newConversations.forEach((conv, index) => {
        const payload = { ...conv, sortOrder: index };
        // console.log("Saving to DB:", payload);
        store.put(payload);
        // store.put({
        //   ...conv,
        //   sortOrder: index, // preserve original order from backend
        // });
      });

      // console.log("All conversations have been saved or overwritten.");
    } catch (error) {
      console.error("Error saving conversations to IndexedDB:", error);
    }
  };

  useEffect(() => {
    const getConversations = async () => {
      const cachedConversations = await loadCachedConversations(); // Load cached data first
      setConversations(cachedConversations);

      if (navigator.onLine) {
        // Fetch from live data if online
        // setLoading(true);
        try {
          if (session) {
            const fetchedConversations = await getUsersForSidebar(userId);
            // console.log("Fetched new conversations:", fetchedConversations);

            if (fetchedConversations.length > 0) {
              setConversations(fetchedConversations);
              await saveConversationsToDB(fetchedConversations); // Save new ones to DB
              // console.log("fetched converstions saved to db");
            }
          } else {
            // console.log("No session available");
          }
        } catch (error) {
          // console.error("Error fetching conversations:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    getConversations();
  }, []);

  return { loading, conversations, setConversations };
};

export default useGetConversations;
