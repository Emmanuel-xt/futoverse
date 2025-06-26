"use client";

import { useEffect, useState } from "react";
import { X, Users } from "lucide-react";
import { UserCard } from "./UserCard";
import { fetchUsersFriendList } from "@lib/actions/connect.prisma";

// interface ConnectionsPanelProps {
//   isOpen: boolean
//   onClose: () => void
//   userId: number
// }

export function ConnectionsPanel({ isOpen, onClose, userId, username }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchConnections = async () => {
        try {
          const friends = await fetchUsersFriendList(username);
          setConnections(friends);
        } catch (error) {
          console.error("Error fetching connections:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchConnections();
    }
  }, [isOpen, userId]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Connections</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {loading ? (
            <div className="p-4 text-center">Loading connections...</div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Users size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No connections yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {connections.map((connection) => (
                <UserCard
                  key={connection.id}
                  user={connection}
                  currentUserId={userId}
                  showFollowButton={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
