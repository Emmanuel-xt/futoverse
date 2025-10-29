import { Suspense } from "react";
import { PostFeed } from "@components/post/post-feed";
import { PostSkeleton } from "@components/post/post-skeleton";
import { getPosts } from "@lib/actions/post-actions";
import { auth } from "auth";
import { WhatsHappening } from "@components/post/whats-happening";
import { InstallButton } from "@components/InstallButton";
import { PostFeedCompact } from "@components/post/post-feed-compact";

export default async function HomePage() {
  const session = await auth();
  const CURRENT_USER = {
    id: Number(session?.user?.id) || null,
    name: session?.user?.name || "Guest",
    picture: session?.user?.image || null,
    canPost: true,
  };
  // console.log("Current User:", session);
  const CURRENT_USER_ID = Number(session?.user?.id) || null;
  const initialData = await getPosts(undefined, 10, CURRENT_USER_ID);

  return (
    <div className="container mx-auto px-1 max-w-2xl">
      {/* Sticky Futoverse banner */}
      <div className="sticky top-0 z-50 bg-white border-b py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          futoverse
        </h1>
        <p className="hidden">
          Futoverse lets you explore FUTO campus in 3D, connect with students,
          and discover stores — all in one immersive platform.
        </p>
        <InstallButton />
      </div>

      {/* Rest of the scrollable content */}
      <div className="py-6 space-y-2">
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
          {/* <PostFeed userId={CURRENT_USER_ID} initialPosts={initialData} /> */}
          <PostFeedCompact
            userId={CURRENT_USER_ID}
            initialPosts={initialData}
            // featureComponents={
            //   {
            //     // candidates: SUGCandidatesHomeRow,
            //     // events: EventsHomeRow,
            //     // products: ProductsHomeRow,
            //     // Add more features as needed
            //   }
            // }
          />
        </Suspense>
      </div>
    </div>
  );
}
