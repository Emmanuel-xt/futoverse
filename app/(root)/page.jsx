import { Suspense } from "react";
import { PostSkeleton } from "@components/post/post-skeleton";
import { getPosts } from "@lib/actions/post-actions";
import { auth } from "auth";
import { WhatsHappening } from "@components/post/whats-happening";
import { PostFeedCompact } from "@components/post/post-feed-compact";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { FeatureNavigation } from "@components/feature-navigation";
import { Search } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const CURRENT_USER = {
    id: Number(session?.user?.id) || null,
    name: session?.user?.name || "Guest",
    picture: session?.user?.image || null,
    canPost: true,
  };
  const CURRENT_USER_ID = Number(session?.user?.id) || null;
  const initialData = await getPosts(undefined, 10, CURRENT_USER_ID);

  return (
    <div className="container mx-auto px-1 max-w-2xl">
      {/* Sticky Futoverse banner */}
      <div className="sticky top-0 z-50 bg-white border-b py-4 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="flex justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            futoverse
          </h1>

          <Link
            href={"/finds"}
            className="p-2 hover:bg-gray-100 rounded-full relative "
          >
            <Search size={20} />
          </Link>
        </div>
        <p className="hidden">
          Futoverse lets you explore FUTO campus in 3D, connect with students,
          and discover stores — all in one immersive platform.
        </p>
        {/* <InstallButton /> */}
      </div>

      <div className="py-6 space-y-4">
        {/* 👇 Login UI for guests */}
        {!CURRENT_USER_ID && (
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5 text-center shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-lg font-semibold text-primary">
                Welcome to Futoverse 🌍
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Sign in to connect with fellow students, post updates, and
                explore the campus in 3D.
              </p>
              <Link href="/login">
                <Button className="mt-2 bg-primary">Log in to Continue</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Post input (only show if logged in) */}
        {CURRENT_USER_ID && (
          <WhatsHappening
            userId={CURRENT_USER.id}
            userCanPost={CURRENT_USER.canPost}
            userName={CURRENT_USER.name}
            userPicture={CURRENT_USER.picture}
          />
        )}

        <div className="max-w-6xl mx-auto px-1 py-2">
          <FeatureNavigation />
        </div>

        {/* Posts feed */}
        <Suspense
          fallback={
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PostFeedCompact
            userId={CURRENT_USER_ID}
            initialPosts={initialData}
          />
        </Suspense>
      </div>
    </div>
  );
}
