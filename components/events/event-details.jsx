"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  User,
  Globe,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";

import Linkify from "linkify-react";
// import "linkify-plugin-url"; // optional if you want to handle URLs only

const linkifyOptions = {
  target: "_blank",
  rel: "noopener noreferrer",
  className: "text-blue-600 underline break-all",
};

export default function EventDetailsClient({ event }) {
  const router = useRouter();
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const shareEventLink = async (eventId) => {
    // Construct the URL to your event page
    const eventLink = `${window.location.origin}/finds/events/${eventId}`;

    try {
      await navigator.share({
        title: "🎉 You're Invited!",
        text: "\nCheck out this awesome event happening soon on Futoverse!",
        url: eventLink,
      });
    } catch (error) {
      console.warn("Share failed or cancelled:", error);
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(eventLink);
        alert("Event link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy link:", clipboardError);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const isEventPast = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  };

  const getAvailableSpots = () => {
    return event.maxAttendees - event.attendees;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-16 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Event details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event header */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      {event.category && (
                        <Badge variant="outline" className="text-sm">
                          {event.category}
                        </Badge>
                      )}
                      {isEventSoon(event.date) && (
                        <Badge className="bg-red-500 hover:bg-red-600">
                          Starting Soon
                        </Badge>
                      )}
                      {event.isOnline && (
                        <Badge variant="secondary">
                          <Globe className="w-3 h-3 mr-1" />
                          Happening Now
                        </Badge>
                      )}
                      {isEventPast(event.endDate) && (
                        <Badge variant="secondary" className="bg-gray-500">
                          Past Event
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    <Linkify options={linkifyOptions}>
                      {event.description}
                    </Linkify>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event image */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setIsImageFullscreen(true)}
                >
                  <Image
                    src={event.image || "/placeholder.svg?height=400&width=600"}
                    alt={event.title}
                    width={600}
                    height={400}
                    className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Organized by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{event.organizer}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Event info */}
          <div className="space-y-6">
            {/* Event details card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.date)} - {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Attendance</p>
                    <p className="text-sm text-gray-600">
                      {event.attendees} / {event.maxAttendees} attendees
                    </p>
                    <p className="text-xs text-gray-500">
                      {getAvailableSpots()} spots remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="text-lg font-bold text-green-600">
                      {event.price === 0
                        ? "Free"
                        : `₦${event.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration button */}
            <Card>
              <CardContent className="p-6">
                {isEventPast(event.endDate) ? (
                  <Button disabled className="w-full h-12 text-lg">
                    Event Ended
                  </Button>
                ) : getAvailableSpots() <= 0 ? (
                  <Button disabled className="w-full h-12 text-lg">
                    Event Full
                  </Button>
                ) : (
                  <Button className="w-full hidden h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    {event.price === 0
                      ? "Register for Free"
                      : `Register - ₦${event.price.toLocaleString()}`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Share button */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={() => shareEventLink(event.id)}
                  variant="outline"
                  className="w-full h-12 text-lg bg-transparent"
                >
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen image modal */}
      {isImageFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={event.image || "/placeholder.svg?height=800&width=1200"}
              alt={event.title}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />

            {/* Close button */}
            <button
              onClick={() => setIsImageFullscreen(false)}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all duration-200 shadow-lg"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
