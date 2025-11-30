"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@components/ui/button";
import {
  ArrowLeft,
  Bell,
  Delete,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  UserPlus,
} from "lucide-react";
import { NotificationPanel } from "./notification-panel";
import { ConnectionsPanel } from "./connections-panel";
import { ProfileActions } from "./profile-actions";
import { useRouter } from "next/navigation";
import Message from "@components/chat/messages/Message";
import { MessagePanel } from "./message-panel";
import { getConversationByUserId } from "@lib/actions/Chat.prisma";
import useConversation from "zustand/useConversation";
import MessageContainer from "@components/chat/messages/MessageContainer";
import { signOut } from "next-auth/react";
import { sendPushNotification } from "@lib/notification/notification-action";
import { clearChatDB } from "@lib/indexedDB";
import { ClipboardCopy } from "lucide-react"; // Or any copy icon you prefer
import { toast } from "sonner";
import Link from "next/link";

export function ProfileHeader({
  user,
  userPop,
  friendCount,
  isOwnProfile,
  isFriend,
  hasSentRequest,
  currentUserId,
  isPanel = false, // Add this prop
  onClose,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessageContainer, setShowMessageContainer] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const router = useRouter();
  const { selectedConversation, setSelectedConversation } = useConversation();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const inviteLink = `${window.location.origin}/sign-up?invite=${user.id}`;
  const profileLink = `${window.location.origin}/profile/${user.username}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast("Invite link copied!");
    } catch {
      toast("Failed to copy invite link");
    }
  };

  const shareInviteLink = async () => {
    try {
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        // Try fetching the image
        const response = await fetch(
          user.picture || user.image || "/images/mainflier.jpg"
        );
        const blob = await response.blob();
        const file = new File([blob], "invite.png", { type: blob.type });

        // Attempt to share with image
        await navigator.share({
          title: "Join me on the Futoverse!",
          text: "Sign up using my invite link and get points!",
          url: inviteLink,
          files: [file],
        });
      } else {
        // Fallback to share without image
        await navigator.share({
          title: "Join me on the Campus App!",
          text: "Sign up using my invite link and get points!",
          url: inviteLink,
        });
      }
    } catch (error) {
      // If share fails or is cancelled, fallback to simple alert or do nothing
      console.warn("Share failed or cancelled:", error);
    }
  };
  const shareProfileLink = async () => {
    try {
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        // Attempt to share with image
        await navigator.share({
          title: "Futoverse User",
          text: "Check out ",
          url: profileLink,
          files: [file],
        });
      } else {
        // Fallback to share without image
        await navigator.share({
          title: "Join me on the Campus App!",
          text: "Sign up using my invite link and get points!",
          url: profileLink,
        });
      }
    } catch (error) {
      // If share fails or is cancelled, fallback to simple alert or do nothing
      console.warn("Share failed or cancelled:", error);
      try {
        await navigator.clipboard.writeText(profileLink);
        alert("Event link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy link:", clipboardError);
      }
    }
  };

  const handleClickMessage = async (recieverId) => {
    if (!showMessageContainer) {
      window.history.pushState({ panel: "message" }, "", window.location.href);
      setShowMessageContainer(true);
    } else {
      window.history.back();
      return;
    }

    try {
      const conversation = await getConversationByUserId(
        currentUserId,
        recieverId
      );
      if (conversation) {
        setSelectedConversation(conversation); // Set to Zustand or Context store
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  };

  const handleNotificationToggle = () => {
    console.log("User", user);
    if (!showNotifications) {
      window.history.pushState(
        { panel: "notifications" },
        "",
        window.location.href
      );
    } else {
      window.history.back();
    }
    setShowNotifications(!showNotifications);
  };

  const handleConnectionsToggle = () => {
    if (!showConnections) {
      window.history.pushState(
        { panel: "connections" },
        "",
        window.location.href
      );
    } else {
      window.history.back();
    }
    setShowConnections(!showConnections);
  };

  // Handle browser back button
  useState(() => {
    const handlePopState = (event) => {
      if (event.state?.panel === "notifications") {
        setShowNotifications(true);
      } else if (event.state?.panel === "connections") {
        setShowConnections(true);
      } else if (event.state?.panel === "message") {
        setShowMessageContainer(true);
      } else {
        setShowNotifications(false);
        setShowConnections(false);
        setShowMessageContainer(false);
        // If no panel state, close all panels
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });

  return (
    <>
      {/* <div className="relative bg-white border-b border-gray-100"> */}
      {/* Header Actions */}
      <div className="flex justify-between items-center p-2 sticky top-0 left-0 right-0 bg-white z-10 shadow-sm">
        <div className="w-20">
          {!isOwnProfile && ( // Only show back button if not in panel mode
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 ">
          <h1 className="text-lg text-center font-bold">{user?.name}</h1>
        </div>

        <div className="flex items-center gap-3  w-20">
          {isOwnProfile && (
            <>
              {/* <button
                onClick={handleNotificationToggle}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button> */}
              <Link
                href={"/finds"}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <Search size={20} />
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span> */}
              </Link>
              <button
                onClick={() => router.push("/profile/settings")}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <Settings size={20} />
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span> */}
              </button>
              {/* <Button
                variant="ghost"
                className="p-2 hover:bg-gray-100 rounded-full"
                disabled={isSigningOut}
                onClick={async () => {
                  try {
                    setIsSigningOut(true);
                    await clearChatDB(); // 🧹 Clear IndexedDB
                    await signOut({ redirect: false }); // Sign out silently
                    router.push("/"); // Navigate away immediately
                  } catch (err) {
                    console.error("Error signing out:", err);
                  } finally {
                    setIsSigningOut(false);
                  }
                }}
              >
                {isSigningOut ? (
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut size={20} />
                )}
              </Button> */}
            </>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-6">
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={user?.picture || user.image || "/images/noProfile.png"}
                alt={user.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1">
                <UserPlus size={12} />
              </button>
            )}
          </div>

          {/* Username */}
          <h2 className="font-semibold mb-1">@{user.username}</h2>

          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <button
              onClick={handleConnectionsToggle}
              className="text-center hover:opacity-70"
            >
              <div className="text-lg font-bold">{friendCount}</div>
              <div className="text-sm text-gray-600">friends</div>
            </button>
            <div className="text-center">
              <div className="text-lg font-bold">
                {user?._count?.shops || userPop?._count?.shops || 0}
              </div>
              <div className="text-sm text-gray-600">Store</div>
            </div>
            <Link href={"/leaderboard"}>
              <div className="text-center">
                <div className="text-lg font-bold">{user.points}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full max-w-sm">
            {isOwnProfile ? (
              <div className="flex items-center w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-200"
                  onClick={() => router.push("/profile/edit")}
                >
                  {!user.department ? (
                    <p className="text-xs">Complete Profile (50points)</p>
                  ) : (
                    "Edit profile"
                  )}
                </Button>
              </div>
            ) : (
              <ProfileActions
                userId={user.id}
                currentUserId={currentUserId}
                isFriend={isFriend}
                hasSentRequest={hasSentRequest}
              />
            )}

            {!isOwnProfile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleClickMessage(user.id)}
              >
                <MessageCircle size={16} />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={shareProfileLink}>
              <Share2 size={16} />
            </Button>
          </div>

          {/* Bio */}
          {user.about && (
            <p className="text-center text-sm text-gray-700 mt-4 max-w-sm whitespace-pre-line">
              {user.about}
            </p>
          )}

          {/* Department & Level */}
          {(user.department || user.level) && (
            <div className="flex gap-2 mt-2 text-xs text-gray-500">
              {user.department && <span>{user.department.name}</span>}
              {user.department && user.level && <span>•</span>}
              {user.level && <span>{user.level.name} Level</span>}
            </div>
          )}

          {isOwnProfile && (
            <div className="mt-4">
              <p className="text-xs text-center">
                Invite a friend to get 100points{" "}
              </p>
              <div className="flex gap-2 ">
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Copy Link <ClipboardCopy size={16} />
                </Button>

                <Button
                  onClick={shareInviteLink}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Share <Share2 size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* </div> */}

      {/* Sliding Panels */}

      <MessagePanel
        isOpen={showMessageContainer}
        selectedConversation={selectedConversation}
        onClose={() => setShowMessageContainer(false)}
      />
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <ConnectionsPanel
        isOpen={showConnections}
        onClose={() => setShowConnections(false)}
        userId={user.id}
        username={user.username}
      />
    </>
  );
}
