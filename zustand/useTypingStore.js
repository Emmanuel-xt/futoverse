// useTypingStore.js
import { create } from "zustand";

const useTypingStore = create((set) => ({
  typingConversations: {}, // { [conversationId]: { userId, userName } }

  setTyping: (conversationId, user) =>
    set((state) => ({
      typingConversations: {
        ...state.typingConversations,
        [conversationId]: user,
      },
    })),

  removeTyping: (conversationId) =>
    set((state) => {
      const updated = { ...state.typingConversations };
      delete updated[conversationId];
      return { typingConversations: updated };
    }),
}));

export default useTypingStore;
