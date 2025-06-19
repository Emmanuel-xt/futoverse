"use client";

import { Suspense } from "react";
import ChatLayout from "@components/chat/ChatLayout";
import { Loader2 } from "lucide-react";

const ChatPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#2D75FB" }}
          />
        </div>
      }
    >
      <ChatLayout />
    </Suspense>
  );
};

export default ChatPage;
