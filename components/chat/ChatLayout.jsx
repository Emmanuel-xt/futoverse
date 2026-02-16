"use client";
import Sidebar from "./sidebar/Sidebar";
import MessageContainer from "./messages/MessageContainer";
import useConversation from "zustand/useConversation";
import { cn } from "@lib/utils";
import TypingListener from "./sidebar/TypingListener";
import useGlobalMessageListener from "hooks/useGlobalMessageListener";
import useListenMessages from "hooks/useListenMessages";
import useReadReceiptListener from "hooks/useReadMessageListener";
import ImageModal from "@components/ImageModal";

const ChatLayout = () => {
  const { selectedConversation } = useConversation();
  // useGlobalMessageListener();
  useListenMessages();
  useReadReceiptListener();

  return (
    <div className="flex h-[100dvh] bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300",
          selectedConversation && "hidden md:block"
        )}
      >
        <ImageModal />
        <TypingListener />
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 z-50">
        <MessageContainer />
      </div>
    </div>
  );
};

export default ChatLayout;
