import { Suspense } from "react";
// import { getServerSession } from "next-auth/next";
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

export async function generateMetadata({ params }) {
  const username = decodeURIComponent(params.id);

  // fetch the profile data (reuse your helper)
  const profileData = await getProfileData(username);

  // fallback if no profile found
  if (!profileData || !profileData.user) {
    return {
      title: "User not found | Futoverse",
      description: "This profile does not exist on Futoverse.",
      openGraph: {
        title: "User not found | Futoverse",
        description: "This profile does not exist on Futoverse.",
        images: ["/images/mainflier.jpg"],
      },
    };
  }

  const { user } = profileData;

  // --- SMART FALLBACKS ---
  const name = user.name || user.username || "Futoverse User";
  const about =
    user.about ||
    user.bio ||
    `Check out ${name}'s profile on Futoverse — explore their campus activity, shops, posts and more!`;

  const department = user.department?.name || "Student of Futoverse University"; // fallback text

  const profilePicture =
    user.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random`;

  const title = `${name} • ${department}`;
  const description = about;

  return {
    title,
    description,
    keywords: [
      name,
      user.username,
      department,
      "Futoverse",
      "Campus Map",
      "Student Profile",
    ],
    openGraph: {
      title,
      description,
      url: `https://futoverse.app/profile/${user.username}`,
      type: "profile",
      images: [
        {
          url: profilePicture,
          width: 600,
          height: 600,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [profilePicture],
    },
    alternates: {
      canonical: `https://futoverse.app/profile/${user.username}`,
    },
  };
}
