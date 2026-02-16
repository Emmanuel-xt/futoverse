import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProfileTabs } from "@components/profile/profile-tabs";
import { ProfileSkeleton } from "@components/profile/profile-skeleton";
import { fetchUserByUsername } from "@lib/actions/user-queries";
import { fetchUsersFriendCount } from "@lib/actions/connect.prisma";
import { ProfileHeader } from "@components/profile/profile-header";
import { auth } from "auth";
import { ProfilePanelProvider } from "@components/profile/profile-panel-provider";
import NotificationManager from "@components/notification-manager";

// Revalidate profile page every 60 seconds (1 minute)
export const revalidate = 60;

async function getProfileData(username) {
  const [user, friendCount] = await Promise.all([
    fetchUserByUsername(username),
    fetchUsersFriendCount(username),
  ]);

  return { user, friendCount };
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  const { user, friendCount } = await getProfileData(session.user.username);

  // if (!user) {
  //   redirect("/profile/setup");
  // }

  return (
    <div className="min-h-screen pb-14 bg-white">
      <ProfilePanelProvider currentUserId={userId}>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileHeader
            user={user}
            userPop={user}
            friendCount={friendCount}
            isOwnProfile={true}
          />
          <NotificationManager />

          <ProfileTabs
            userId={userId}
            currentUserId={userId}
            username={session.user.username}
            isOwnProfile={true}
          />
        </Suspense>
      </ProfilePanelProvider>
    </div>
  );
}
