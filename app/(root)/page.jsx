import { Suspense } from "react";
import { PostFeed } from "@components/post/post-feed";
import { PostSkeleton } from "@components/post/post-skeleton";
import { getPosts } from "@lib/actions/post-actions";
import { auth } from "auth";

export default async function HomePage() {
  // Pre-fetch initial posts for SSR
  const session = await auth();
  const CURRENT_USER_ID = session?.user?.id || null;
  const initialData = await getPosts(undefined, 10, CURRENT_USER_ID);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campus Feed</h1>
        <p className="text-muted-foreground">
          Stay connected with your campus community
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        }
      >
        <PostFeed userId={CURRENT_USER_ID} initialPosts={initialData} />
      </Suspense>
    </div>
  );
}
