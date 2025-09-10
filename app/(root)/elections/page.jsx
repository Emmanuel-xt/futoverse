import { getCandidates } from "@lib/actions/election";
import { CandidateCard } from "@components/elections/candidates-card";
import Link from "next/link";

export default async function ElectionsPage() {
  const result = await getCandidates();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-800">
            Failed to load candidates. Please try again.
          </div>
        </div>
      </div>
    );
  }

  const candidates = result.data;

  const candidatesByPosition =
    candidates?.reduce((acc, candidate) => {
      const position = candidate.position;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(candidate);
      return acc;
    }, {}) || {};

  const positions = Object.keys(candidatesByPosition);

  return (
    <div className="min-h-screen mb-14 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className=" mx-auto px-4 py-8">
        <div className="mb-8 text-center w-full">
          <h1 className="text-2xl font-bold text-white text-balance mb-2">
            SUG Elections 2024
          </h1>
          <p className="text-green-200">
            Meet the candidates running for Student Union Government positions
          </p>
          <Link href="/elections/register" className="text-blue-700 underline">
            Register a Candidate
          </Link>
        </div>

        {candidates && candidates.length > 0 ? (
          <div className="space-y-8">
            {positions.map((position) => (
              <div key={position} className="space-y-4">
                {/* Position Header */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{position}</h2>
                  <div className="h-px bg-green-400 flex-1"></div>
                  <span className="text-green-300 text-sm font-medium">
                    {candidatesByPosition[position].length} candidate
                    {candidatesByPosition[position].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Candidates Row - Horizontal Scroll */}
                <div className="relative">
                  <div
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {candidatesByPosition[position].map((candidate) => (
                      <div key={candidate.id} className="flex-shrink-0">
                        <CandidateCard candidate={candidate} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-green-800/50 backdrop-blur-sm border border-green-700 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2 text-white">
                No candidates yet
              </h2>
              <p className="text-green-200">Elections will begin soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style> */}
    </div>
  );
}

export const metadata = {
  title: "SUG Elections 2025 | Futoverse",
  description:
    "Meet the candidates running for Student Union Government positions at FUTO. View their profiles, manifestos, and show your support through reactions and comments.",
  keywords: [
    "SUG Elections",
    "FUTO",
    "Student Union Government",
    "Candidates",
    "University Elections",
  ],
  openGraph: {
    title: "SUG Elections 2025 | Futoverse",
    description:
      "Meet the candidates running for Student Union Government positions at FUTO",
    type: "website",
    images: [
      {
        url: "/election.jpg",
        width: 1200,
        height: 630,
        alt: "SUG Elections 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SUG Elections 2025 | Futoverse",
    description:
      "Meet the candidates running for Student Union Government positions at FUTO",
  },
};
