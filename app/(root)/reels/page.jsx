import { Suspense } from "react";
import { ReelsFeed } from "@components/reels/reels-feed";
import { Loader2 } from "lucide-react";
import { getReels } from "@lib/actions/reels";
import { auth } from "auth";

async function ReelsContent({ startIndex }) {
  // TODO: Get currentUserId from your auth system (e.g., Supabase, NextAuth, etc.)
  const session = await auth();
  const currentUserId = Number(session?.user?.id);

  const result = await getReels({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!result.success || !result.data) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>Failed to load reels</p>
      </div>
    );
  }

  // Transform data to match expected format
  const reels = result.data.map((reel) => ({
    id: reel.id,
    embedUrl: reel.embedUrl,
    originalUrl: reel.originalUrl,
    platform: reel.platform,
    thumbnailUrl: reel.thumbnailUrl || undefined,
    tiktokEmbedHtml: reel.tiktokEmbedHtml || undefined,
    caption: reel.caption || undefined,
    hashtags: reel.hashtags,
    postedBy: reel.postedBy,
    likesCount: reel._count.likes,
    commentsCount: reel._count.comments,
    sharesCount: reel._count.shares,
    viewCount: reel.viewCount,
    createdAt: reel.createdAt.toISOString(),
    isLiked: reel.isLiked || false,
  }));

  return (
    <ReelsFeed
      reels={reels}
      initialIndex={startIndex}
      currentUserId={currentUserId}
    />
  );
}

export default async function ReelsPage({ searchParams }) {
  const params = await searchParams;
  const startIndex = Number.parseInt(params.start || "0", 10);

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-black">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      }
    >
      <ReelsContent startIndex={startIndex} />
    </Suspense>
  );
}
