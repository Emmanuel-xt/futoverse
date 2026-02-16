"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { UserCard } from "../UserCard";
import { fetchUnconnectedUsers } from "@lib/actions/user-queries";
import { Skeleton } from "@components/ui/skeleton";
import { Button } from "@components/ui/button";
import Link from "next/link";

export function SuggestedTab({ userId, onUserCardClick, currentUserId }) {
  const observerRef = useRef(null);

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground max-w-sm">
          Log in to discover fellow students, connect with friends, and grow
          your network.
        </p>
        <Link href={"/login"}>
          <Button className="mt-2 font-medium">Log in to continue</Button>
        </Link>
      </div>
    );
  }
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["suggestedUsers", currentUserId],
    queryFn: ({ pageParam = null }) =>
      fetchUnconnectedUsers(currentUserId, pageParam),
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
