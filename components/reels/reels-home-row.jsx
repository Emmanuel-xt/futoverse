import { Suspense } from "react";
import { Clapperboard } from "lucide-react";
import { Button } from "@components/ui/button";
import { getReels } from "@lib/actions/reels";
import Link from "next/link";
import { ReelsHomeRowClient } from "./reels-home-row-client";
import { EmbedSubmitDrawer } from "./reel-submit-modal";

async function ReelsContent() {
  const result = await getReels({
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (!result.success || !result.data || result.data.length === 0) {
    return null;
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
    isLiked: false,
  }));

  return <ReelsHomeRowClient reels={reels} />;
}

export function ReelsHomeRow() {
  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Clapperboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">FUTOverse Reels</h2>
            <p className="text-xs text-muted-foreground">
              Curated campus content
            </p>
          </div>
        </div>
        <Link href="/reels">
          <Button variant="ghost" size="sm" className="text-primary">
            See All
          </Button>
        </Link>
      </div>

      {/* Scrollable row with suspense */}
      <Suspense
        fallback={
          <div className="flex gap-3 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-32 h-48 bg-muted animate-pulse rounded-xl shrink-0"
              />
            ))}
          </div>
        }
      >
        <ReelsContent />
        <EmbedSubmitDrawer postedById={1} />
      </Suspense>
    </div>
  );
}
