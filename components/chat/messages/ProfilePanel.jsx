import { ProfileHeader } from "@components/profile/profile-header";
import React from "react";

const ProfilePane = () => {
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
        onClose={onClose}
      />
    </div>
  );
};

export default ProfilePane;
