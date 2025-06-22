import { create } from "zustand";
import { openDatabase } from "@lib/indexedDB";

const saveConversationsToDB = async (conversations) => {
  try {
    const db = await openDatabase();
    if (!db) return;

    const tx = db.transaction("conversations", "readwrite");
    const store = tx.objectStore("conversations");
    await store.clear();

    conversations.forEach((conv, index) => {
      store.put({ ...conv, sortOrder: index });
    });
  } catch (err) {
    // console.error("Error saving to IndexedDB:", err);
  }
};

const useSidebarConversations = create((set, get) => ({
  conversations: [],
  setConversations: (data) => set({ conversations: data }),

  updateConversations: (newMessage) => {
    // console.log("📥 Called updateConversations with:", newMessage);

    const updated = [...get().conversations];
    const newMessageConvoId = newMessage.message.conversationId;

    // console.log("🧠 ID to match:", newMessageConvoId);
    // console.log(
    //   "This was the conversation gotten from indexedDb or fetched Data",
    //   updated
    // );

    const convoIndex = updated.findIndex(
      (c) => c.conversationId === newMessageConvoId
    );

    // console.log("➡️ About to update position, found index:", convoIndex);

    if (convoIndex !== -1) {
      const convo = updated[convoIndex];
      convo.lastMessage = {
        body: newMessage.message.body,
        isRead: false,
        senderId: newMessage.message.senderId,
        createdAt: newMessage.message.createdAt || new Date().toISOString(),
      };

      // Move to top
      updated.splice(convoIndex, 1);
      updated.unshift(convo);
      // console.log("✅ Moved convo to top:", convo);
    } else {
      console.warn(
        "❗️Couldn't find conversation to update with ID:",
        newMessageConvoId
      );
    }

    // console.log("💾 Saving updated conversations to IndexedDB...");
    saveConversationsToDB(updated);

    set({ conversations: updated });
    // console.log("✅ Conversations updated in Zustand store");
  },

  markLastMessageAsRead: (conversationId) => {
    // console.log("Want to mark last message as read ");
    const updated = [...get().conversations];
    const index = updated.findIndex((c) => c.conversationId === conversationId);

    if (index !== -1) {
      const convo = updated[index];
      if (convo.lastMessage) {
        convo.lastMessage.isRead = true;
      }
      set({ conversations: updated });
    }
    // else {
    //   console.log(
    //     "Couldnt find the conversation with the matching coonversationId"
    //   );
    // }
  },
}));

export default useSidebarConversations;
