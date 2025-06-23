"use client";

import { useQuery } from "@tanstack/react-query";
import { UserCard } from "../user-card";
import { fetchUsersFriendList } from "@lib/actions/connect.prisma";
import { Skeleton } from "@components/ui/skeleton";

export function FriendsTab({ userId, username }) {
  const {
    data: friends,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["friends", username],
    queryFn: () => fetchUsersFriendList(username),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted"
          >
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <div className="flex gap-2">
              {/* No accept/decline buttons here, just dismiss */}
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-2">Failed to load friends.</p>
        <button
          onClick={() => refetch()}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No friends</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {friends.map((friend) => (
        <UserCard
          key={friend.id}
          user={friend}
          currentUserId={userId}
          showFollowButton={false}
        />
      ))}
    </div>
  );
}
