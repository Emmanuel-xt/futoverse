"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";

// interface NotificationPanelProps {
//   isOpen: boolean
//   onClose: () => void
// }

export function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([
    // {
    //   id: 1,
    //   type: "friend_request",
    //   message: "John Doe sent you a friend request",
    //   time: "2 minutes ago",
    //   read: false,
    // },
    // {
    //   id: 2,
    //   type: "friend_accept",
    //   message: "Jane Smith accepted your friend request",
    //   time: "1 hour ago",
    //   read: false,
    // },
    // {
    //   id: 3,
    //   type: "message",
    //   message: "You have a new message from Mike",
    //   time: "3 hours ago",
    //   read: true,
    // },
  ]);

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
        className={`fixed top-0 left-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {/* <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button> */}
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Bell size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="text-sm">{notification.body}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
