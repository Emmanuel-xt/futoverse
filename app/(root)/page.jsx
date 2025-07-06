import { Suspense } from "react";
import { PostFeed } from "@components/post/post-feed";
import { PostSkeleton } from "@components/post/post-skeleton";
import { getPosts } from "@lib/actions/post-actions";
import { auth } from "auth";
import { WhatsHappening } from "@components/post/whats-happening";
import { InstallButton } from "@components/InstallButton";

export default async function HomePage() {
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
    <div className="container mx-auto px-4 max-w-2xl">
      {/* Sticky Futoverse banner */}
      <div className="sticky top-0 z-50 bg-white border-b py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          futoverse
        </h1>
        <InstallButton />
      </div>

      {/* Rest of the scrollable content */}
      <div className="py-6 space-y-2">
        <div>
          <h2 className="text-xl font-semibold mb-1">Campus Feed</h2>
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
    </div>
  );
}
