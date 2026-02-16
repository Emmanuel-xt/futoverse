// Re-export from split files for backward compatibility
// New code should import directly from conversation.prisma.js or message.prisma.js
export {
  getUsersForSidebar,
  getSearchedUsersForConversation,
  findOrCreateConversation,
  getConversationByUserId,
  getUserForConversation,
  createGroupChat,
  fetchAllGroups,
  syncConversationMembers,
} from "./conversation.prisma";

export {
  getMessagesOfUsers,
  getAllMessagesOfUsers,
  sendMessageToUser,
  markMessagesAsRead,
} from "./message.prisma";
