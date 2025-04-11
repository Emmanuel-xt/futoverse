import { getUsersForSidebar } from "@lib/actions/Chat.prisma";
import { openDatabase } from "@lib/indexedDB";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { data: session } = useSession();
  const userId = parseFloat(session?.user.id);

  // Load cached conversations
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

      console.log("Cached data:", cachedData);

      if (cachedData.length > 0) {
        setConversations(cachedData);
      }

      return cachedData; // ✅ Return cached data
    } catch (error) {
      console.error("Error loading cached conversations:", error);
      return [];
    }
  };

  // Save or update conversations in IndexedDB
  const saveConversationsToDB = async (newConversations) => {
    try {
      const db = await openDatabase();
      if (!db) return;

      if (!db.objectStoreNames.contains("conversations")) {
        console.warn("Object store missing, skipping save.");
        return;
      }

      const tx = db.transaction("conversations", "readwrite");
      const store = tx.objectStore("conversations");

      // Get existing data first
      const existingData = await store.getAll();
      const existingIds = new Set(existingData.map((conv) => conv.id)); // Assume each conversation has a unique "id"

      // Find new conversations that are NOT in IndexedDB
      const newEntries = newConversations.filter(
        (conv) => !existingIds.has(conv.id)
      );

      if (newEntries.length > 0) {
        console.log("Adding new conversations to IndexedDB:", newEntries);
        newEntries.forEach((item) => store.put(item));
      } else {
        console.log("No new conversations to add.");
      }
    } catch (error) {
      console.error("Error saving conversations to IndexedDB:", error);
    }
  };

  useEffect(() => {
    const getConversations = async () => {
      await openDatabase(); // Ensure DB is initialized

      // const cachedConversations = await loadCachedConversations(); // Load cached data first

      if (navigator.onLine) {
        setLoading(true);
        try {
          if (session) {
            const fetchedConversations = await getUsersForSidebar(userId);
            console.log("Fetched conversations:", fetchedConversations);

            if (fetchedConversations.length > 0) {
              setConversations(fetchedConversations);
              await saveConversationsToDB(fetchedConversations); // ✅ Only add new ones
            }
          }
        } catch (error) {
          console.error("Error fetching conversations:", error);
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    getConversations();
  }, [session]);

  return { loading, conversations, setConversations };
};

export default useGetConversations;

// useEffect(() => {
//   const getConversations = async () => {
//     await openDatabase(); // Ensure DB is initialized

//     const cachedConversations = await loadCachedConversations(); // Load cached data first

//     if (navigator.onLine) {
//       setLoading(true);
//       try {
//         const fetchedConversations = await getUsersForSidebar();

//         // 🔥 Prevent setting state if response is invalid
//         if (!fetchedConversations || fetchedConversations.length === 0) {
//           console.warn("Fetched data is empty or undefined. Keeping cached conversations.");
//           return;
//         }

//         console.log("Fetched conversations:", fetchedConversations);

//         setConversations(fetchedConversations); // ✅ Only update if data is valid
//         await saveConversationsToDB(fetchedConversations); // ✅ Only save valid new data

//       } catch (error) {
//         console.error("Error fetching conversations:", error);
//         toast.error("Network error! Showing cached conversations.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   getConversations();
// }, []);
