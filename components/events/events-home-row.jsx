"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { getUpcomingEvents } from "@lib/actions/events.prisma";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function EventsHomeRow() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const result = await getUpcomingEvents();
      return result;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 mins
  });

  if (isLoading) return null;
  if (error) return null;

  const events = data?.data ?? [];
  if (!events.length) return null;

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">UPCOMING EVENTS</h3>
        <Link
          href="/finds/events"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          See all →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event) => (
          <Link href={`/finds/events/${event.id}`} key={event.id}>
            <Card className="flex-shrink-0 w-56 overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              {/* Event Image */}
              <div className="relative w-full h-32 bg-gray-200">
                <Image
                  src={
                    event.image ||
                    "/placeholder.svg?height=128&width=224&query=event" ||
                    "/placeholder.svg"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                {event.price > 0 && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    ${event.price}
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="p-3">
                {/* Title */}
                <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h4>

                {/* Category Badge */}
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <Calendar size={14} />
                  <span>
                    {formatDate(event.date)} at {formatTime(event.date)}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <MapPin size={14} />
                  <span className="truncate">
                    {event.isOnline ? "Online" : event.location}
                  </span>
                </div>

                {/* Attendees */}
                {event.maxAttendees && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <Users size={14} />
                    <span>
                      {event.attendees}/{event.maxAttendees} attending
                    </span>
                  </div>
                )}

                {/* View Button */}
                <Button
                  size="sm"
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                >
                  View Event
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
