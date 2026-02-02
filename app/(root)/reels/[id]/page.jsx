import { notFound } from "next/navigation";
import { getReelById, incrementReelView } from "@lib/actions/reels";
import { ArrowLeft, Eye, Heart, Share2, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { SanitizedEmbed } from "@components/reels/sanitized-embed";

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getReelById(id);

  if (!result.success || !result.data) {
    return {
      title: "Reel Not Found",
      description: "The requested reel could not be found.",
    };
  }

  const reel = result.data;
  const platformName =
    reel.platform.charAt(0) + reel.platform.slice(1).toLowerCase();

  return {
    title: reel.caption || `${platformName} Reel on futoverse`,
    description: reel.caption
      ? `${reel.caption.slice(0, 155)}...`
      : `Watch this ${platformName} reel`,
    keywords: reel.hashtags?.join(", "),
    openGraph: {
      title: reel.caption || `${platformName} Reel on futoverse`,
      description: reel.caption || `Watch this ${platformName} reel`,
      type: "video.other",
      images: reel.thumbnailUrl
        ? [
            {
              url: reel.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: reel.caption || "Reel thumbnail",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: reel.caption || `${platformName} Reel on futoverse`,
      description: reel.caption || `Watch this ${platformName} reel`,
      images: reel.thumbnailUrl ? [reel.thumbnailUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ReelPage({ params }) {
  const { id } = await params;
  const result = await getReelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const reel = result.data;

  // Increment view count
  await incrementReelView(id);

  const platformColors = {
    TIKTOK: "bg-black text-white",
    INSTAGRAM: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    YOUTUBE: "bg-red-600 text-white",
    FACEBOOK: "bg-blue-600 text-white",
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Badge className={platformColors[reel.platform]}>
              {reel.platform}
            </Badge>
          </div>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Video Player */}
        <div className="bg-muted rounded-xl overflow-hidden mb-6">
          <div className="aspect-video">
            {reel.platform === "TIKTOK" && reel.tiktokEmbedHtml ? (
              <SanitizedEmbed
                html={reel.tiktokEmbedHtml}
                className="w-full h-full flex items-center justify-center"
              />
            ) : (
              <iframe
                src={reel.embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">
              {reel.viewCount?.toLocaleString() || 0} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">
              {reel.likes?.toLocaleString() || 0} likes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(reel.createdAt)}</span>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {reel.caption}
            </h1>
          </div>
        )}

        {/* Hashtags */}
        {reel.hashtags && reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {reel.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Hash className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Posted By */}
        {reel.postedBy && (
          <div className="flex items-center gap-3 pt-6 border-t">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {reel.postedBy.avatar ? (
                <img
                  src={reel.postedBy.avatar || "/placeholder.svg"}
                  alt={reel.postedBy.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {reel.postedBy.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {reel.postedBy.name}
              </p>
              <p className="text-xs text-muted-foreground">Posted this reel</p>
            </div>
          </div>
        )}

        {/* Original Link */}
        <div className="mt-6 pt-6 border-t">
          <a
            href={reel.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View original on{" "}
            {reel.platform.charAt(0) + reel.platform.slice(1).toLowerCase()}
          </a>
        </div>
      </div>
    </main>
  );
}
