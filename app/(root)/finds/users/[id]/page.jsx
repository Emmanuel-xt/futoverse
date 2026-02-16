import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@components/profile/profile-header";
import { ProfileTabs } from "@components/profile/profile-tabs";
import { ProfileSkeleton } from "@components/profile/profile-skeleton";
import { fetchUserByUsername } from "@lib/actions/user-queries";
import {
  fetchUsersFriendCount,
  areFriends,
  hasSentFriendRequest,
} from "@lib/actions/connect.prisma";
import { auth } from "auth";
import { ProfilePanelProvider } from "@components/profile/profile-panel-provider";

async function getProfileData(username, currentUserId) {
  const user = await fetchUserByUsername(username);

  if (!user) return null;

  const [friendCount, isFriend, hasSentRequest] = await Promise.all([
    fetchUsersFriendCount(username),
    currentUserId ? areFriends(currentUserId, user.id) : false,
    currentUserId ? hasSentFriendRequest(currentUserId, user.id) : false,
  ]);

  return {
    user,
    friendCount,
    isFriend,
    hasSentRequest,
  };
}

export default async function UserProfilePage({ params }) {
  const session = await auth();
  const username = decodeURIComponent(params.id);

  const profileData = await getProfileData(
    username,
    session?.user?.id ? Number.parseFloat(session.user.id) : undefined
  );

  if (!profileData) {
    notFound();
  }
  const currentUserId = Number(session?.user?.id);

  const { user, friendCount, isFriend, hasSentRequest } = profileData;

  return (
    <div className="min-h-screen bg-white pb-14">
      <ProfilePanelProvider currentUserId={currentUserId}>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileHeader
            user={user}
            friendCount={friendCount}
            isOwnProfile={false}
            isFriend={isFriend}
            hasSentRequest={hasSentRequest}
            currentUserId={
              session?.user?.id ? Number.parseFloat(session.user.id) : undefined
            }
          />
          <ProfileTabs
            userId={user.id}
            username={user.username}
            isOwnProfile={false}
            currentUserId={
              session?.user?.id ? Number.parseFloat(session.user.id) : undefined
            }
          />
        </Suspense>
      </ProfilePanelProvider>
    </div>
  );
}
