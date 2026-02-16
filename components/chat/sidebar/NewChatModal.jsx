"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useConversation from "zustand/useConversation";
import {
  findOrCreateConversation,
  getSearchedUsersForConversation,
} from "@lib/actions/conversation.prisma";
import { useSession } from "next-auth/react";

// interface NewChatModalProps {
//   open: boolean
//   onClose: () => void
// }

const NewChatModal = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedConversation } = useConversation();
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);

  useEffect(() => {
    if (open && searchQuery.length > 2) {
      searchUsers();
    }
  }, [searchQuery, open]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const users = await getSearchedUsersForConversation(searchQuery);
      setUsers(users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    const result = await findOrCreateConversation(currentUserId, user.id);
    if (result?.receiver) {
      setSelectedConversation(result.receiver);
    }

    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "#2D75FB" }}
                />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={user.picture || "/images/noProfile.png"}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Type to search for users</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
