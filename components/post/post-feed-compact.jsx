"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { usePosts } from "hooks/use-posts";
import { PostFeedCard } from "./post-feed-card";
import { PostSkeleton } from "./post-skeleton";
import { Alert, AlertDescription } from "@components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EditPostDialog } from "./edit-post-dialog";
import { DeletePostDialog } from "./delete-post-dialog";
import { CommentDrawer } from "./comment-drawer";
import { ShareDialog } from "./share-dialog";
import { SUGCandidatesHomeRow } from "@components/elections/sug-candidates-home-row";
import { EventsHomeRow } from "@components/events/events-home-row";
import { ProductsHomeRow } from "@components/products/products-home-row";

export function PostFeedCompact({ userId, initialPosts }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePosts(userId);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const featureComponents = {
    events: EventsHomeRow,
    candidates: SUGCandidatesHomeRow,
    // candidates: SUGCandidatesHomeRow,
    products: ProductsHomeRow,
    // Add more features as needed
  };

  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "300px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: 1 }).map((_, i) => (
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

  const posts = data?.pages?.flatMap((page) => page?.posts ?? []) ?? [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts available yet.</p>
      </div>
    );
  }

  const renderFeedWithFeatures = () => {
    const feedItems = [];
    const featureKeys = Object.keys(featureComponents);
    const totalFeatures = featureKeys.length;

    posts.forEach((post, index) => {
      feedItems.push(
        <PostFeedCard
          key={post.id}
          post={post}
          userId={userId}
          onEdit={(p) => {
            setSelectedPost(p);
            setShowEditDialog(true);
          }}
          onDelete={(p) => {
            setSelectedPost(p);
            setShowDeleteDialog(true);
          }}
          onComment={(p) => {
            setSelectedPost(p);
            setShowCommentDrawer(true);
          }}
          onShare={(p) => {
            setSelectedPost(p);
            setShowShareDialog(true);
          }}
        />
      );

      // 🧩 Inject features after every 2 posts, but only once per feature
      const featureIndex = Math.floor((index + 1) / 2) - 1;

      if ((index + 1) % 2 === 0 && featureIndex < totalFeatures) {
        const featureKey = featureKeys[featureIndex];
        const FeatureComponent = featureComponents[featureKey];

        feedItems.push(
          <div
            key={`feature-${featureKey}-${index}`}
            className="py-4 border-b border-gray-200 dark:border-gray-800"
          >
            <FeatureComponent />
          </div>
        );
      }
    });

    return feedItems;
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {renderFeedWithFeatures()}

      <div
        ref={ref}
        className="divide-y divide-gray-200 mb-16 dark:divide-gray-800"
      >
        {isFetchingNextPage && (
          <>
            <PostSkeleton />
            {/* <PostSkeleton /> */}
          </>
        )}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            You've reached the end of the feed
          </p>
        </div>
      )}

      {/* Dialogs and Drawers */}
      {selectedPost && (
        <>
          <EditPostDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            post={selectedPost}
            userId={userId}
          />
          <DeletePostDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            post={selectedPost}
            userId={userId}
          />
          <CommentDrawer
            isOpen={showCommentDrawer}
            onClose={() => setShowCommentDrawer(false)}
            postId={selectedPost.id}
            userId={userId}
          />
          <ShareDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            post={selectedPost}
          />
        </>
      )}
    </div>
  );
}
