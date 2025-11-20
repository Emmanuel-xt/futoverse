"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { X } from "lucide-react";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@lib/actions/connect.prisma";
import { toast } from "sonner";

// interface UserCardProps {
//   user: any
//   currentUserId: number
//   showFollowButton: boolean
//   isRequest?: boolean
//   onRequestAction?: (action: "accept" | "decline") => void
// }

export function UserCard({
  user,
  currentUserId,
  showFollowButton,
  isRequest,
  onRequestAction,
  onUserCardClick, // Add this prop
}) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const send = await sendFriendRequest(currentUserId, user.id);
      if (send.success) {
        toast.success("Request sent");
      } else {
        toast.error("Failed to send request");
      }
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const accept = await acceptFriendRequest(currentUserId, user.id);
      if (accept.success) {
        toast.success(`You are now friends with ${user.name}`);
        onRequestAction?.("accept");
      }
    } catch (error) {
      toast.error("Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const reject = await rejectFriendRequest(currentUserId, user.id);
      if (reject.success) {
        toast.success("Request declined");
        onRequestAction?.("decline");
      }
    } catch (error) {
      toast.error("Failed to decline request");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (onUserCardClick) {
      console.log("user was clicked");
      onUserCardClick(user.username);
    } else {
      // Fallback to navigation if no panel handler
      console.log("falling back to profile header");
      window.location.href = `/profile/${user.username}`;
    }
  };

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg">
      <button onClick={handleUserClick} className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={user.picture || "/images/noProfile.png"}
            alt={user.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      <div className="flex-1 min-w-0">
        <button onClick={handleUserClick} className="text-left w-full">
          <h4 className="font-semibold text-sm truncate">{user.name}</h4>
          <p className="text-xs text-gray-600 truncate">
            {user.department?.initial}{" "}
            {user.level?.name && `(${user.level.name}lvl)`}
          </p>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {showFollowButton && !isRequest && (
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4"
            onClick={handleFollow}
            disabled={loading}
          >
            {loading ? "Sending..." : "Connect"}
          </Button>
        )}

        {isRequest && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleAccept}
              disabled={loading}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              disabled={loading}
            >
              Decline
            </Button>
          </div>
        )}

        {/* <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-gray-200 rounded-full"
        >
          <X size={16} className="text-gray-400" />
        </button> */}
      </div>
    </div>
  );
}
