import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProfileTabs } from "@components/profile/profile-tabs";
import { ProfileSkeleton } from "@components/profile/profile-skeleton";
import { fetchUserByUsername } from "@lib/actions/user.prisma";
import { fetchUsersFriendCount } from "@lib/actions/connect.prisma";
import { ProfileHeader } from "@components/profile/profile-header";
import { auth } from "auth";

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

  const { user, friendCount } = await getProfileData(session.user.username);

  if (!user) {
    redirect("/profile/setup");
  }

  return (
    <div className="min-h-screen pb-14 bg-white">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileHeader
          user={user}
          friendCount={friendCount}
          isOwnProfile={true}
        />
        <ProfileTabs
          userId={user.id}
          username={user.username}
          isOwnProfile={true}
        />
      </Suspense>
    </div>
  );
}
