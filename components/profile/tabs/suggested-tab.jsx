"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { UserCard } from "../user-card";
import { fetchUnconnectedUsers } from "@lib/actions/user.prisma";
import { Skeleton } from "@components/ui/skeleton";

export function SuggestedTab({ userId, onUserCardClick }) {
  const observerRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["suggestedUsers", userId],
    queryFn: ({ pageParam = null }) => fetchUnconnectedUsers(userId, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Observer to fetch more when sentinel comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const users = data?.pages.flatMap((page) => page.users) || [];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Suggested accounts</h3>
        <p className="text-sm text-gray-600">People you may know</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            currentUserId={userId}
            showFollowButton={true}
            onUserCardClick={onUserCardClick}
          />
        ))}

        {(isLoading || isFetchingNextPage) &&
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted"
            >
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}

        <div ref={observerRef} className="h-1" />
      </div>

      {isError && (
        <div className="text-center mt-4 text-red-500">
          Failed to load suggestions.
          <button
            onClick={() => refetch()}
            className="block text-blue-600 mt-2 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
