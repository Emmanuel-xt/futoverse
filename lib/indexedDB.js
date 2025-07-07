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
export const saveMessagesToDB = async (
  senderId,
  authenticatedUser,
  messages
) => {
  const db = await openDatabase();
  const tx = db.transaction("messages", "readwrite");
  const store = tx.objectStore("messages");

  // Store messages with a conversation key
  await store.put({
    id: `${senderId}-${authenticatedUser}`, // Unique key for each conversation
    messages,
  });

  await tx.done;
};

// Get messages from IndexedDB
export const getMessagesFromDB = async (receiverId, senderId) => {
  const db = await openDatabase();
  const tx = db.transaction("messages", "readonly");
  const store = tx.objectStore("messages");

  const result = await store.get(`${senderId}-${receiverId}`);
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
