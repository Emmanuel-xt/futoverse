import { openDB, deleteDB } from "idb";

const DB_NAME = "chatDB";
const DB_VERSION = 2; // Increment if upgrading
const CONVERSATIONS_STORE = "conversations";
const MESSAGES_STORE = "messages";

// Initialize DB
export const openDatabase = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          db.createObjectStore(CONVERSATIONS_STORE, { keyPath: "id" });
          // console.log(`"${CONVERSATIONS_STORE}" store created.`);
        }
        if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
          db.createObjectStore(MESSAGES_STORE, { keyPath: "id" });
          // console.log(`"${MESSAGES_STORE}" store created.`);
        }
      },
    });

    return db;
  } catch (error) {
    console.error("Error opening database:", error);
  }
};

// Store messages in IndexedDB
// Key format: conversationId-userId (consistent across all callers)
export const saveMessagesToDB = async (
  conversationId,
  userId,
  messages
) => {
  const db = await openDatabase();
  const tx = db.transaction("messages", "readwrite");
  const store = tx.objectStore("messages");

  await store.put({
    id: `${conversationId}-${userId}`,
    messages,
  });

  await tx.done;
};

// Get messages from IndexedDB
export const getMessagesFromDB = async (conversationId, userId) => {
  const db = await openDatabase();
  const tx = db.transaction("messages", "readonly");
  const store = tx.objectStore("messages");

  const result = await store.get(`${conversationId}-${userId}`);
  return result ? result.messages : [];
};

export const clearChatDB = async () => {
  try {
    await deleteDB("chatDB");
    console.log("IndexedDB cleared on sign out.");
  } catch (error) {
    console.error("Failed to clear IndexedDB:", error);
  }
};
