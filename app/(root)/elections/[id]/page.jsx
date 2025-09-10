import { getCandidate } from "@lib/actions/election";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { ReactionButton } from "@components/elections/reaction-button";
import { CommentSection } from "@components/elections/comment-section";

export default async function CandidateProfilePage({ params }) {
  const result = await getCandidate(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">
          Candidate not found or failed to load.
        </div>
      </div>
    );
  }

  const candidate = result.data;

  return (
    <div className="container mx-auto px- py-8 max-w-4xl mb-14">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/elections">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Link>
      </Button>

      {/* Candidate Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage
                src={candidate.picture || "/placeholder.svg"}
                alt={candidate.name}
              />
              <AvatarFallback className="text-2xl">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar> */}
            <img
              src={
                // "/images/mainflier.jpg" ||
                candidate.picture ||
                "/placeholder.svg?height=200&width=280&query=professional headshot"
              }
              alt={candidate.name}
              className="w-full h-48 object-contain rounded-lg"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl font-bold mb-2">{candidate.name}</h1>
              <Badge variant="secondary" className="text px-3 py-1 mb-3">
                {candidate.position}
              </Badge>
              {candidate.slogan && (
                <p className="text text-muted-foreground italic">
                  "{candidate.slogan}"
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reactions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Quick Reactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 flex-wrap">
            <ReactionButton
              candidateId={candidate.id}
              type="🔥"
              count={candidate.reactionCounts["🔥"] || 0}
              label="Hype"
            />
            <ReactionButton
              candidateId={candidate.id}
              type="❤️"
              count={candidate.reactionCounts["❤️"] || 0}
              label="Support"
            />
            <ReactionButton
              candidateId={candidate.id}
              type="💡"
              count={candidate.reactionCounts["💡"] || 0}
              label="Good Idea"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {candidate.bio && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why I'm Contesting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pretty leading-relaxed">{candidate.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Manifesto */}
      {candidate.manifesto && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manifesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-pretty leading-relaxed whitespace-pre-wrap">
                {candidate.manifesto}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <CommentSection
        candidateId={candidate.id}
        comments={candidate.comments}
      />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const result = await getCandidate(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Candidate Not Found | Futoverse",
      description: "The requested candidate profile could not be found.",
    };
  }

  const candidate = result.data;

  return {
    title: `${candidate.name} - ${candidate.position} | SUG Elections 2025`,
    description: candidate.slogan
      ? `${candidate.name} is running for ${candidate.position}. "${candidate.slogan}" - Learn more about their manifesto and show your support.`
      : `${candidate.name} is running for ${candidate.position} in the SUG Elections 2024. Learn more about their manifesto and show your support.`,
    keywords: [
      candidate.name,
      candidate.position,
      "SUG Elections",
      "FUTO",
      "Student Union Government",
    ],
    openGraph: {
      title: `${candidate.name} - ${candidate.position}`,
      description:
        candidate.slogan ||
        `Running for ${candidate.position} in SUG Elections 2024`,
      type: "profile",
      images: [
        {
          url: candidate.picture || "/placeholder.svg",
          width: 400,
          height: 400,
          alt: `${candidate.name} - Candidate for ${candidate.position}`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${candidate.name} - ${candidate.position}`,
      description:
        candidate.slogan ||
        `Running for ${candidate.position} in SUG Elections 2025`,
    },
  };
}
