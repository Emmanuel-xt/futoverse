"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Users,
  Search,
} from "lucide-react";
import { Button } from "@components/ui/button";
import useConversation from "zustand/useConversation";
import { useOnlineUsers } from "@components/providers/OnlineUsersProvider";
import Image from "next/image";

import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import Messages from "./Messages";
import { useRouter } from "next/navigation";
import { useProfilePanel } from "@components/profile/profile-panel-provider";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const onlineUsers = useOnlineUsers();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [openProfilePanel, setOpenProfilePanel] = useState(false);
  const router = useRouter();
  const { openProfile } = useProfilePanel();

  // console.log("Selected COnversation", selectedConversation);

  const isOnline =
    selectedConversation &&
    onlineUsers.some((user) => user.userId === selectedConversation.id);

  const handleBack = () => {
    // setSelectedConversation(null);
    window.history.back();
  };

  const handleViewProfile = () => {
    if (!selectedConversation?.username) return;
    openProfile(selectedConversation.username);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onPopState = (e) => {
      if (e.state?.conversationOpen) {
        // Stay on the same page — no action needed
      } else {
        // Clear the selected conversation when going back
        setSelectedConversation(null);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex flex-1 z-40 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-64 h-64 mx-auto mb-8 opacity-20">
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <defs>
                <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f9f9f9" />
                  <stop offset="100%" stopColor="#e9e9e9" />
                </linearGradient>
              </defs>
              <g fill="none" fillRule="evenodd">
                <path
                  fill="url(#a)"
                  d="M229.077 172H73.923C33.128 172 0 138.872 0 98.077V73.923C0 33.128 33.128 0 73.923 0h155.154C268.872 0 302 33.128 302 73.923v24.154C302 138.872 268.872 172 229.077 172z"
                />
                <path
                  fill="#FFF"
                  d="M229.077 12H73.923C39.755 12 12 39.755 12 73.923v24.154C12 132.245 39.755 160 73.923 160h155.154c34.168 0 61.923-27.755 61.923-61.923V73.923C291 39.755 263.245 12 229.077 12z"
                />
                <path
                  fill="#DDD"
                  d="M100.085 87.123c2.842 0 5.148-2.306 5.148-5.148s-2.306-5.148-5.148-5.148-5.148 2.306-5.148 5.148 2.306 5.148 5.148 5.148zm51.83 0c2.842 0 5.148-2.306 5.148-5.148s-2.306-5.148-5.148-5.148-5.148 2.306-5.148 5.148 2.306 5.148 5.148 5.148zm51.83 0c2.842 0 5.148-2.306 5.148-5.148s-2.306-5.148-5.148-5.148-5.148 2.306-5.148 5.148 2.306 5.148 5.148 5.148z"
                />
              </g>
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-600 mb-2">
            Keep your phone connected
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            WhatsApp connects to your phone to sync messages. To reduce data
            usage, connect your phone to Wi-Fi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen ">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {selectedConversation.isGroup ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: "#2D75FB" }}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <Image
                    src={
                      selectedConversation.picture || "/images/noProfile.png"
                    }
                    alt={selectedConversation.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {!selectedConversation.isGroup && isOnline && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full"
                  style={{ backgroundColor: "#2D75FB" }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-gray-900 truncate">
                {selectedConversation.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.isGroup
                  ? `${selectedConversation.participantCount || 0} participants`
                  : isOnline
                  ? "online"
                  : "last seen recently"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
            {/* <Button variant="ghost" size="sm" className="p-2">
              <Phone className="w-5 h-5 text-gray-600" />
            </Button> */}
            {/* <Button variant="ghost" size="sm" className="p-2">
              <Video className="w-5 h-5 text-gray-600" />
            </Button> */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
                    Contact info
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={handleViewProfile}
                  >
                    View Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                    Delete chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col h-screen  bg-gray-50 relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Messages />
        <TypingIndicator />
        <MessageInput />
      </div>
      {/* {openProfilePanel && } */}
    </div>
  );
};

export default MessageContainer;
