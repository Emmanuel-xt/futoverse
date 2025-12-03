import { Suspense } from "react";
import { ReelsFeed } from "@components/reels/reels-feed";
import { Loader2 } from "lucide-react";
import { getReels } from "@lib/actions/reels";

// const TIKTOK_EMBED_HTML = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@princess_ihekoronye/video/7578613331460738324" data-video-id="7578483758433684744" data-embed-from="embed_page" style="max-width:605px; min-width:325px;"> </blockquote>`;
const TIKTOK_EMBED_HTML = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@itz_riyomi/video/7578483758433684744" data-video-id="7578483758433684744" data-embed-from="embed_page" style="max-width:605px; min-width:200px;"> <section> <a target="_blank" title="@itz_riyomi" href="https://www.tiktok.com/@itz_riyomi?refer=embed">@itz_riyomi</a> <p></p> <a target="_blank" title="♬ original sound - itscallmethekidd" href="https://www.tiktok.com/music/original-sound-7532925734382340886?refer=embed">♬ original sound - itscallmethekidd</a> </section> </blockquote>`;
// const TIKTOK_EMBED_HTML = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@itz_riyomi/video/7578483758433684744" data-video-id="7578483758433684744" data-embed-from="embed_page" style="max-width:605px; min-width:200px;"> <section> <a target="_blank" title="@itz_riyomi" href="https://www.tiktok.com/@itz_riyomi?refer=embed">@itz_riyomi</a> <p>Delta camp Sunday — we wear mufti, eat well and breathe fresh air <a title="deltacamp2025" target="_blank" href="https://www.tiktok.com/tag/deltacamp2025?refer=embed">#deltacamp2025</a> <a title="nyscdelta" target="_blank" href="https://www.tiktok.com/tag/nyscdelta?refer=embed">#nyscdelta</a> <a title="nysccamp" target="_blank" href="https://www.tiktok.com/tag/nysccamp?refer=embed">#nysccamp</a> <a title="nysc2025" target="_blank" href="https://www.tiktok.com/tag/nysc2025?refer=embed">#nysc2025</a> <a title="nysc" target="_blank" href="https://www.tiktok.com/tag/nysc?refer=embed">#nysc</a> </p> <a target="_blank" title="♬ original sound - itscallmethekidd" href="https://www.tiktok.com/music/original-sound-7532925734382340886?refer=embed">♬ original sound - itscallmethekidd</a> </section> </blockquote>`;

// Mock data - replace with actual API call
const mockReels = [
  {
    id: "1",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    platform: "YOUTUBE",
    thumbnailUrl: "/campus-party-video-thumbnail.jpg",
    caption:
      "FUTO campus vibes are unmatched! This is what student life is all about.",
    hashtags: ["futoverse", "campuslife", "naija", "studentlife"],
    postedBy: {
      id: 1,
      username: "tech_bro",
      name: "David Okonkwo",
      picture: "/young-african-male-student.jpg",
      department: { name: "Computer Science", initial: "CSC" },
      level: { name: "400L" },
    },
    likesCount: 1234,
    commentsCount: 89,
    sharesCount: 45,
    viewCount: 5600,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    embedUrl: "https://www.tiktok.com/@itz_riyomi/video/7578483758433684744",
    originalUrl: "https://www.tiktok.com/@itz_riyomi/video/7578483758433684744",
    platform: "TIKTOK",
    thumbnailUrl: "/nysc-camp-sunday-mufti-day.jpg",
    caption:
      "Delta camp Sunday — we wear mufti, eat well and breathe fresh air",
    hashtags: ["deltacamp2025", "nyscdelta", "nysccamp", "nysc2025", "nysc"],
    tiktokEmbedHtml: TIKTOK_EMBED_HTML,
    postedBy: {
      id: 2,
      username: "itz_riyomi",
      name: "Riyomi",
      picture: "/young-african-female-student-smiling.jpg",
      department: { name: "Mass Communication", initial: "MCM" },
      level: { name: "Service Year" },
    },
    likesCount: 8567,
    commentsCount: 234,
    sharesCount: 178,
    viewCount: 23400,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    embedUrl:
      "https://www.instagram.com/reel/DP9hKwUAsWS/?igsh=YmQxZ29nbXNsOWUw/embed",
    originalUrl:
      "https://www.instagram.com/reel/DP9hKwUAsWS/?igsh=YmQxZ29nbXNsOWUw",
    platform: "INSTAGRAM",
    thumbnailUrl: "/university-graduation-celebration-nigerian.jpg",
    caption:
      "Convocation loading... After all the stress, it finally paid off!",
    hashtags: ["graduation", "futo2024", "blessed", "convocation"],
    postedBy: {
      id: 3,
      username: "igwe_chi",
      name: "Chinedu Igwe",
      picture: "/african-male-graduate-student-happy.jpg",
      department: { name: "Electrical Engineering", initial: "EEE" },
      level: { name: "500L" },
    },
    likesCount: 3456,
    commentsCount: 167,
    sharesCount: 89,
    viewCount: 12000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "4",
    embedUrl:
      "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D1234567890&show_text=false",
    originalUrl: "https://www.facebook.com/watch/?v=1234567890",
    platform: "FACEBOOK",
    thumbnailUrl: "/nigerian-university-football-match.jpg",
    caption: "FUTO vs FUPRE! Who won? The rivalry continues!",
    hashtags: ["futosports", "naijauniversity", "football", "campussports"],
    postedBy: {
      id: 4,
      username: "sports_chief",
      name: "Emmanuel Eze",
      picture: "/athletic-african-male-student.jpg",
      department: { name: "Physical Education", initial: "PHE" },
      level: { name: "400L" },
    },
    likesCount: 2100,
    commentsCount: 312,
    sharesCount: 156,
    viewCount: 8700,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    embedUrl: "https://www.youtube.com/embed/kffacxfA7G4",
    originalUrl: "https://www.youtube.com/shorts/shorts123",
    platform: "YOUTUBE",
    thumbnailUrl: "/cooking-nigerian-jollof-rice-hostel.jpg",
    caption: "Hostel cooking hits different. When you miss mama food...",
    hashtags: ["hostellife", "jollofrice", "futofood", "studentcooking"],
    postedBy: {
      id: 5,
      username: "chef_amaka",
      name: "Amaka Okoro",
      picture: "/young-african-female-cooking.jpg",
      department: { name: "Food Technology", initial: "FST" },
      level: { name: "200L" },
    },
    likesCount: 4567,
    commentsCount: 123,
    sharesCount: 67,
    viewCount: 15600,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

async function ReelsContent({ startIndex }) {
  // TODO: Get currentUserId from your auth system (e.g., Supabase, NextAuth, etc.)
  // const session = await getSession()
  // const currentUserId = session?.user?.id
  const currentUserId = undefined; // Replace with actual auth

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
