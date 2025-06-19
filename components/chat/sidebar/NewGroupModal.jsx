"use client";

import { useState } from "react";
import { Users, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import Image from "next/image";

// interface NewGroupModalProps {
//   open: boolean
//   onClose: () => void
// }

const NewGroupModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1); // 1: Select participants, 2: Group details
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUserToggle = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch("/api/conversations/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          participants: selectedUsers.map((u) => u.id),
        }),
      });

      if (response.ok) {
        handleClose();
        // Optionally redirect to the new group
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedUsers([]);
    setGroupName("");
    setGroupDescription("");
    setSearchQuery("");
    setUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Add Participants" : "Group Details"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: "#2D75FB" }}
                  >
                    <span>{user.name}</span>
                    <button
                      onClick={() => handleUserToggle(user)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2">
              {users.map((user) => {
                const isSelected = selectedUsers.find((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleUserToggle(user)}
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
                    {isSelected && (
                      <Check className="w-5 h-5" style={{ color: "#2D75FB" }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={selectedUsers.length === 0}
                className="text-white"
                style={{ backgroundColor: "#2D75FB" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1E5FE0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2D75FB")
                }
              >
                Next ({selectedUsers.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="font-medium"
                />
              </div>
            </div>

            <Textarea
              placeholder="Group description (optional)"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              rows={3}
            />

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">
                Participants: {selectedUsers.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={user.picture || "/images/noProfile.png"}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || loading}
                className="text-white"
                style={{ backgroundColor: "#2D75FB" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1E5FE0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2D75FB")
                }
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                Create Group
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupModal;
