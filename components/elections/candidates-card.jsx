"use client";

import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { MessageCircle, Heart } from "lucide-react";
import Link from "next/link";

export function CandidateCard({ candidate }) {
  return (
    <Link href={`/elections/${candidate.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 hover:shadow-green-100/50 min-w-[280px] max-w-[300px]">
        <CardContent className="p-4">
          {/* Profile Image - Rectangular like Facebook */}
          <div className="relative mb-3">
            <img
              src={
                candidate.picture ||
                "/placeholder.svg?height=200&width=280&query=professional headshot"
              }
              alt={candidate.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-green-600 text-white border-0 shadow-md"
            >
              {candidate.position}
            </Badge>
          </div>

          {/* Candidate Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-green-900 text-balance leading-tight">
              {candidate.name}
            </h3>

            {candidate.slogan && (
              <p className="text-sm text-green-700 italic text-pretty line-clamp-2">
                "{candidate.slogan}"
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <div className="flex items-center gap-1 text-green-600">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {candidate._count.comments}
                </span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {candidate._count.reactions}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
