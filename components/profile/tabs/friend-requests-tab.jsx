"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCard } from "../user-card";
import { fetchPendingFriendRequests } from "@lib/actions/connect.prisma";
import { Skeleton } from "@components/ui/skeleton"; // Replace with your Skeleton component

export function FriendRequestsTab({ userId, onUserCardClick }) {
  const queryClient = useQueryClient();

  const {
    data: requests,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["friendRequests", userId],
    queryFn: () => fetchPendingFriendRequests(userId),
    retry: 2, // Retry on failure (optional)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleRequestAction = (action, requestId) => {
    if (action === "accept" || action === "decline") {
      queryClient.setQueryData(["friendRequests", userId], (old) =>
        old?.filter((r) => r.id !== requestId)
      );
    }
  };

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
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
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
        <p className="text-red-500 mb-2">Failed to load requests.</p>
        <button
          onClick={() => refetch()}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No Pending Friend Request</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {requests.map((request) => (
        <UserCard
          key={request.id}
          user={request.sender}
          currentUserId={userId}
          showFollowButton={true}
          isRequest={true}
          onRequestAction={(action) => handleRequestAction(action, request.id)}
          onUserCardClick={onUserCardClick}
        />
      ))}
    </div>
  );
}
