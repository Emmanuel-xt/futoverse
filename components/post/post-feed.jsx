"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { usePosts } from "hooks/use-posts";
import { PostCard } from "./post-card";
import { PostSkeleton } from "./post-skeleton";
import { Alert, AlertDescription } from "@components/ui/alert";
import { AlertCircle } from "lucide-react";

export function PostFeed({ userId, initialPosts }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePosts(userId);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load posts. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userId={userId} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="space-y-6">
          {isFetchingNextPage && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
