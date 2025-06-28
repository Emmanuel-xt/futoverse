import { Suspense } from "react";
import { PostFeed } from "@components/post/post-feed";
import { PostSkeleton } from "@components/post/post-skeleton";
import { getPosts } from "@lib/actions/post-actions";
import { auth } from "auth";
import { WhatsHappening } from "@components/post/whats-happening";

export default async function HomePage() {
  // Pre-fetch initial posts for SSR
  const session = await auth();
  const CURRENT_USER = {
    id: Number(session?.user?.id) || null,
    name: session?.user?.name || "Guest",
    picture: session?.user?.picture || null,
    canPost: true,
  };
  const CURRENT_USER_ID = Number(session?.user?.id) || null;
  const initialData = await getPosts(undefined, 10, CURRENT_USER_ID);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Campus Feed</h1>
        <p className="text-muted-foreground">
          Stay connected with your campus community
        </p>
      </div>

      <WhatsHappening
        userId={CURRENT_USER.id}
        userCanPost={CURRENT_USER.canPost}
        userName={CURRENT_USER.name}
        userPicture={CURRENT_USER.picture}
      />

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
