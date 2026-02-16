"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";
import { ProfileSkeleton } from "./profile-skeleton";
import { fetchUserByUsername } from "@lib/actions/user-queries";
import {
  fetchUsersFriendCount,
  areFriends,
  hasSentFriendRequest,
} from "@lib/actions/connect.prisma";

export function ProfilePanel({
  username,
  currentUserId,
  isOpen,
  onClose,
  onOpenProfile,
  panelIndex = 0,
}) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      fetchProfileData();
    }
  }, [isOpen, username, currentUserId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(false);

      const user = await fetchUserByUsername(username);
      if (!user) {
        setError(true);
        return;
      }

      const [friendCount, isFriend, hasSentRequest] = await Promise.all([
        fetchUsersFriendCount(username),
        currentUserId ? areFriends(currentUserId, user.id) : false,
        currentUserId ? hasSentFriendRequest(currentUserId, user.id) : false,
      ]);

      setProfileData({
        user,
        friendCount,
        isFriend,
        hasSentRequest,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCardClick = (clickedUsername) => {
    if (clickedUsername !== username) {
      onOpenProfile(clickedUsername);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        style={{ zIndex: 40 + panelIndex }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300`}
        style={{ zIndex: 50 + panelIndex }}
      >
        {/* Panel Header */}
        {/* <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div> */}

        {/* Panel Content */}
        <div className="h-full overflow-y-auto pb-20">
          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">Failed to load profile</p>
              <button
                onClick={fetchProfileData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : profileData ? (
            <ProfilePanelContent
              profileData={profileData}
              currentUserId={currentUserId}
              onUserCardClick={handleUserCardClick}
              closer={onClose}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function ProfilePanelContent({
  profileData,
  currentUserId,
  onUserCardClick,
  closer,
}) {
  const { user, friendCount, isFriend, hasSentRequest } = profileData;

  return (
    <div className="min-h-screen bg-white">
      <ProfileHeader
        user={user}
        friendCount={friendCount}
        isOwnProfile={false}
        isFriend={isFriend}
        hasSentRequest={hasSentRequest}
        currentUserId={currentUserId}
        isPanel={true}
        onClose={closer}
      />
      <ProfileTabs
        userId={user.id}
        currentUserId={currentUserId}
        username={user.username}
        isOwnProfile={false}
        onUserCardClick={onUserCardClick}
        isPanel={true}
      />
    </div>
  );
}
