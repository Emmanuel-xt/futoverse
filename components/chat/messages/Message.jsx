"use client";

import { useState, memo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Check, CheckCheck, Reply } from "lucide-react";
import useConversation from "zustand/useConversation";
import { cn } from "@lib/utils";
import VoiceMessage from "./VoiceMessage";
// import ImageMessage from "./ImageMessage";

// interface MessageProps {
//   message: any
//   isGrouped?: boolean
// }

const Message = memo(function Message({ message, isGrouped = false }) {
  const { data: session } = useSession();
  const { selectedConversation } = useConversation();
  const [showMenu, setShowMenu] = useState(false);

  if (!message || typeof message !== "object") {
    console.warn("Message component received invalid message:", message);
    return null; // don't render anything if message is invalid
  }
  const isFromMe = message?.senderId == session?.user?.id;
  const isSystemMessage = message?.senderId === 141618;

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full max-w-xs text-center">
          {message.body}
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = () => {
    if (!isFromMe) return null;

    if (message.status === "read" || message.isRead) {
      return <CheckCheck className="w-4 h-4 text-white" />;
    } else if (message.status === "delivered") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "VOICE":
        return <VoiceMessage message={message} />;
      case "IMAGE":
        // return <ImageMessage message={message} />;
        return <>Image Message here</>;
      case "VIDEO":
        return (
          <div className="relative">
            <video
              src={message.mediaUrl}
              className="max-w-xs rounded-lg"
              controls
            />
            {message.body && <p className="mt-2 text-sm">{message.body}</p>}
          </div>
        );
      default:
        return (
          <div className="whitespace-pre-wrap break-words">{message.body}</div>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-1",
        isFromMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[70%]",
          isFromMe ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar (only show for group chats and not grouped messages) */}
        {selectedConversation?.isGroup && !isFromMe && !isGrouped && (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2 mt-auto">
            <Image
              src={message.sender?.picture || "/images/noProfile.png"}
              alt="Avatar"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "relative rounded-lg px-3 py-2 shadow-sm",
            isFromMe
              ? "text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm border border-gray-200",
            selectedConversation?.isGroup && !isFromMe && !isGrouped && "ml-10"
          )}
          style={isFromMe ? { backgroundColor: "#2D75FB" } : {}}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(true);
          }}
        >
          {/* Sender name for group chats */}
          {selectedConversation?.isGroup && !isFromMe && !isGrouped && (
            <div
              className="text-xs font-medium mb-1"
              style={{ color: "#2D75FB" }}
            >
              {message.sender?.name || "Unknown"}
            </div>
          )}

          {/* Reply indicator */}
          {message?.replyTo && (
            <div
              className={cn(
                "border-l-4 pl-2 mb-2 text-xs opacity-75",
                isFromMe ? "border-white/50" : ""
              )}
              style={!isFromMe ? { borderColor: "#2D75FB" } : {}}
            >
              <div className="font-medium">
                {message.replyTo.sender?.name || "Unknown"}
              </div>
              <div className="truncate">
                {message.replyTo.body || "Media message"}
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className="text-sm">{renderMessageContent()}</div>

          {/* Message Footer */}
          <div
            className={cn(
              "flex items-center justify-end space-x-1 mt-1 text-xs",
              isFromMe ? "text-white/70" : "text-gray-500"
            )}
          >
            {message.isEdited && <span className="italic">edited</span>}
            <span>{formatTime(message.createdAt)}</span>
            {getStatusIcon()}
          </div>

          {/* Message Menu */}
          {showMenu && (
            <div className="absolute top-0 right-0 bg-white text-black rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                Forward
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                Star
              </button>
              {isFromMe && (
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Message;
