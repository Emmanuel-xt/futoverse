"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";
import MessageContainer from "@components/chat/messages/MessageContainer";

// interface NotificationPanelProps {
//   isOpen: boolean
//   onClose: () => void
// }

export function MessagePanel({ isOpen, onClose, selectedConversation }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && selectedConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen && selectedConversation ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col min-w-0 z-50">
          <MessageContainer />
        </div>
      </div>
    </>
  );
}
