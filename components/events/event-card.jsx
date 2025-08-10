"use client";

import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EventCard({ event }) {
  const router = useRouter();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isEventSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffInHours =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours > 0;
  };

  const handleClick = () => {
    if (event.id) {
      router.push(`events/${event.id}`);
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative">
        <Image
          src={event.image || "/placeholder.svg?height=200&width=300"}
          alt={event.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {isEventSoon(event.date) && (
            <Badge className="bg-red-500 hover:bg-red-600">Soon</Badge>
          )}
          {event.isOnline && <Badge variant="secondary">Online</Badge>}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] leading-tight">
              {event.title}
            </h3>
            {event.category && (
              <Badge variant="outline" className="text-xs mt-2">
                {event.category}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-3">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(event.date)} - {formatTime(event.endDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {event.attendees}/{event.maxAttendees}
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  {event.price === 0
                    ? "Free"
                    : `₦${event.price.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 line-clamp-1">
            by {event.organizer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
