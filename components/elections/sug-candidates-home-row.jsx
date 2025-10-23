"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { getCandidates } from "@lib/actions/election";

export function SUGCandidatesHomeRow() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sug-candidates"],
    queryFn: async () => {
      // Call your server function directly
      const result = await getCandidates();
      return result;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 mins
  });

  if (isLoading) return null;
  if (error) return null;

  const candidates = data?.data ?? [];
  if (!candidates.length) return null;

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
        {candidates.slice(0, 6).map((candidate) => (
          <Link href={`/elections/${candidate.id}`} key={candidate.id}>
            <Card className="flex-shrink-0 w-40 p-3 border border-gray-200">
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
                <Button
                  size="sm"
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                >
                  View Profile
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
