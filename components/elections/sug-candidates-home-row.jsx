import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { getCandidates } from "@lib/actions/election";

export async function SUGCandidatesHomeRow() {
  const result = await getCandidates();
  const candidates = result.data;
  console.log("candidares", candidates);

  if (!candidates || candidates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          SUG ELECTION 2025
        </h3>
        <Link
          href="/elections"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          See all →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {candidates?.slice(0, 6).map((candidate) => (
          <Card
            key={candidate.id}
            className="flex-shrink-0 w-40 p-3 border border-gray-200"
          >
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <Image
                  src={
                    candidate.picture ||
                    "/placeholder.svg?height=80&width=80&query=candidate"
                  }
                  alt={candidate.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>

              <h4 className="font-medium text-sm text-gray-900 mb-1 truncate">
                {candidate.name}
              </h4>

              <p className="text-xs text-gray-600 mb-2 truncate">
                {candidate.position}
              </p>

              <Link href={`/elections/${candidate.id}`}>
                <Button
                  size="sm"
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
