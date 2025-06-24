"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { UserPlus, UserMinus, Clock } from "lucide-react";
import {
  sendFriendRequest,
  cancelFriendRequest,
  disconnectFriends,
} from "@lib/actions/connect.prisma";
import { toast } from "sonner";

// interface ProfileActionsProps {
//   userId: number
//   currentUserId?: number
//   isFriend?: boolean
//   hasSentRequest?: boolean
// }

export function ProfileActions({
  userId,
  currentUserId,
  isFriend,
  hasSentRequest,
}) {
  const [loading, setLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState({
    isFriend: isFriend || false,
    hasSentRequest: hasSentRequest || false,
  });

  const handleFriendAction = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      if (friendStatus.isFriend) {
        const result = await disconnectFriends(currentUserId, userId);
        if (result.success) {
          setFriendStatus({ isFriend: false, hasSentRequest: false });
          toast.success("Connection removed");
        }
      } else if (friendStatus.hasSentRequest) {
        const result = await cancelFriendRequest(currentUserId, userId);
        if (result.success) {
          setFriendStatus({ isFriend: false, hasSentRequest: false });
          toast.success("Request cancelled");
        }
      } else {
        const success = await sendFriendRequest(currentUserId, userId);
        if (success) {
          setFriendStatus({ isFriend: false, hasSentRequest: true });
          toast.success("Request sent");
        }
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (friendStatus.isFriend) {
      return { text: "Connected", icon: UserMinus, variant: "outline" };
    } else if (friendStatus.hasSentRequest) {
      return { text: "Pending", icon: Clock, variant: "outline" };
    } else {
      return { text: "Connect", icon: UserPlus, variant: "default" };
    }
  };

  const { text, icon: Icon, variant } = getButtonContent();

  return (
    <Button
      variant={variant}
      className="flex-1"
      onClick={handleFriendAction}
      disabled={loading}
    >
      <Icon size={16} className="mr-2" />
      {loading ? "Loading..." : text}
    </Button>
  );
}
