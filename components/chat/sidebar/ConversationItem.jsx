"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, CheckCheck, Users, VolumeX } from "lucide-react";
import useConversation from "zustand/useConversation";
import { markMessagesAsRead } from "@lib/actions/Chat.prisma";
import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import useTypingStore from "zustand/useTypingStore";
import { cn } from "@lib/utils";
import socket from "@components/socket/Socket";
import useSidebarConversations from "zustand/useSidebarConversations";
import useImageModal from "hooks/useImageModal";

// interface ConversationItemProps {
//   conversation: any
// }

const ConversationItem = ({ conversation }) => {
  const { data: session } = useSession();
  const { selectedConversation, setSelectedConversation } = useConversation();
  const onlineUsers = useOnlineUsers();
  const { openModal } = useImageModal();

  const typingConversations = useTypingStore((s) => s.typingConversations);
  const typingUser = typingConversations[conversation.conversationId];

  const isSelected = selectedConversation?.id === conversation.id;
  const isOnline = onlineUsers.some((user) => user.userId === conversation.id);
  const lastMessage = conversation.lastMessage;
  const isFromMe = lastMessage?.senderId == session?.user?.id;
  const isUnread = !lastMessage?.isRead && !isFromMe;

  const { markLastMessageAsRead } = useSidebarConversations(); // 🔧 we'll define this below

  const handleClick = async () => {
    setSelectedConversation(conversation);

    // Push a state entry for this conversation
    window.history.pushState(
      { conversationOpen: true },
      "", // title (ignored)
      "" // URL (empty so we stay on same page)
    );

    const conversationId = conversation.conversationId;
    const userId = Number(session?.user?.id);
    const senderId = conversation.id;

    if (conversation.conversationId && isUnread) {
      await markMessagesAsRead(
        conversation.conversationId,
        Number.parseFloat(session?.user.id)
      );

      socket.emit("messageRead", {
        conversationId, // ✅ correct key name
        senderId,
        readerId: userId,
      });
      console.log("Emmitted markRead");

      markLastMessageAsRead(conversationId);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getMessagePreview = () => {
    if (typingUser) return `typing...`;

    if (!lastMessage) return "No messages yet";

    switch (lastMessage.type) {
      case "IMAGE":
        return "📷 Photo";
      case "VOICE":
        return "🎵 Voice message";
      case "VIDEO":
        return "🎥 Video";
      case "FILE":
        return "📎 File";
      default:
        return lastMessage.body?.length > 35
          ? lastMessage.body.substring(0, 35) + "..."
          : lastMessage.body;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100",
        isSelected && "border-blue-200"
      )}
      style={isSelected ? { backgroundColor: "#E3F2FD" } : {}}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mr-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {conversation.isGroup ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: "#2D75FB" }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
          ) : (
            <Image
              src={conversation.picture || "/images/noProfile.png"}
              alt={conversation.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering the conversation select
                if (conversation.picture) openModal(conversation.picture);
              }}
            />
          )}
        </div>
        {!conversation.isGroup && isOnline && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full"
            style={{ backgroundColor: "#2D75FB" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              "font-medium text-gray-900 truncate",
              isUnread && "font-semibold"
            )}
          >
            {conversation.name}
          </h3>
          {lastMessage && (
            <span
              className={cn(
                "text-xs flex-shrink-0 ml-2",
                isUnread ? "font-medium" : "text-gray-500"
              )}
              style={isUnread ? { color: "#2D75FB" } : {}}
            >
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {isFromMe && lastMessage && !typingUser && (
              <div className="mr-1 flex-shrink-0">
                {lastMessage.isRead ? (
                  <CheckCheck className="w-4 h-4 text-blue-500" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
            <p
              className={cn(
                "text-sm truncate",
                isUnread ? "text-gray-900 font-medium" : "text-gray-600",
                typingUser && "text-blue-500 italic"
              )}
            >
              {getMessagePreview()}
            </p>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            {conversation.isMuted && (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            {isUnread && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#2D75FB" }}
              >
                <span className="text-xs text-white font-medium">
                  {conversation.unreadCount || 1}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
