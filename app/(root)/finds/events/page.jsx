"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Badge } from "@components/ui/badge";
import {
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";
import Image from "next/image";

// Mock events data
const mockEvents = [
  // {
  //   id: 1,
  //   title: "Tech Innovation Summit 2024",
  //   description:
  //     "Join us for a day of cutting-edge technology presentations and networking",
  //   date: "2024-02-15T09:00:00Z",
  //   endDate: "2024-02-15T17:00:00Z",
  //   location: "Main Auditorium",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Technology",
  //   organizer: "Computer Science Department",
  //   attendees: 150,
  //   maxAttendees: 200,
  //   price: 0,
  //   isOnline: false,
  //   tags: ["tech", "innovation", "networking"],
  // },
  // {
  //   id: 2,
  //   title: "Career Fair 2024",
  //   description: "Meet with top employers and explore career opportunities",
  //   date: "2024-02-20T10:00:00Z",
  //   endDate: "2024-02-20T16:00:00Z",
  //   location: "Sports Complex",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Career",
  //   organizer: "Career Services",
  //   attendees: 300,
  //   maxAttendees: 500,
  //   price: 0,
  //   isOnline: false,
  //   tags: ["career", "jobs", "networking"],
  // },
  // {
  //   id: 3,
  //   title: "Annual Science Symposium",
  //   description:
  //     "Showcase of student research projects and scientific discoveries",
  //   date: "2024-03-01T08:30:00Z",
  //   endDate: "2024-03-01T18:00:00Z",
  //   location: "Science Building",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Academic",
  //   organizer: "Faculty of Sciences",
  //   attendees: 80,
  //   maxAttendees: 120,
  //   price: 15,
  //   isOnline: false,
  //   tags: ["science", "research", "academic"],
  // },
  // {
  //   id: 4,
  //   title: "Student Orientation Week",
  //   description:
  //     "Welcome new students with activities, tours, and information sessions",
  //   date: "2024-01-25T09:00:00Z",
  //   endDate: "2024-01-29T17:00:00Z",
  //   location: "Various Locations",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Social",
  //   organizer: "Student Affairs",
  //   attendees: 450,
  //   maxAttendees: 600,
  //   price: 0,
  //   isOnline: false,
  //   tags: ["orientation", "welcome", "social"],
  // },
  // {
  //   id: 5,
  //   title: "Entrepreneurship Workshop",
  //   description: "Learn the basics of starting your own business",
  //   date: "2024-02-28T14:00:00Z",
  //   endDate: "2024-02-28T17:00:00Z",
  //   location: "Business School",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Workshop",
  //   organizer: "Business Department",
  //   attendees: 45,
  //   maxAttendees: 60,
  //   price: 25,
  //   isOnline: true,
  //   tags: ["business", "entrepreneurship", "workshop"],
  // },
  // {
  //   id: 6,
  //   title: "Cultural Festival",
  //   description:
  //     "Celebrate diversity with music, dance, and food from around the world",
  //   date: "2024-03-15T12:00:00Z",
  //   endDate: "2024-03-15T22:00:00Z",
  //   location: "Campus Grounds",
  //   image: "/placeholder.svg?height=200&width=300",
  //   category: "Cultural",
  //   organizer: "International Students Association",
  //   attendees: 200,
  //   maxAttendees: 400,
  //   price: 10,
  //   isOnline: false,
  //   tags: ["culture", "festival", "international"],
  // },
];

const categories = [
  "Technology",
  "Career",
  "Academic",
  "Social",
  "Workshop",
  "Cultural",
  "Sports",
];

const dateFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Next Month", value: "next-month" },
];

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("events-list");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    searchParams.get("date") || "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedDateFilter !== "all") params.set("date", selectedDateFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/events${newUrl}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedDateFilter, router]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return mockEvents
      .filter((event) => {
        const eventDate = new Date(event.date);

        const matchesSearch =
          !searchQuery ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          selectedCategory === "all" || event.category === selectedCategory;

        let matchesDate = true;
        if (selectedDateFilter !== "all") {
          const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
          const startOfWeek = new Date(
            startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000
          );
          const endOfWeek = new Date(
            startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
          );
          const endOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 2,
            0
          );

          switch (selectedDateFilter) {
            case "today":
              matchesDate = eventDate >= startOfDay && eventDate < endOfDay;
              break;
            case "week":
              matchesDate = eventDate >= startOfWeek && eventDate < endOfWeek;
              break;
            case "month":
              matchesDate =
                eventDate >= startOfMonth && eventDate <= endOfMonth;
              break;
            case "next-month":
              matchesDate =
                eventDate >= startOfNextMonth && eventDate <= endOfNextMonth;
              break;
          }
        }

        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [searchQuery, selectedCategory, selectedDateFilter]);

  const handleEventClick = (eventId) => {
    saveScrollPosition();
    router.push(`/finds/events/${eventId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDateFilter("all");
  };

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-muted-foreground">Discover upcoming FUTO events</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search events by title, description, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          {(selectedCategory !== "all" || selectedDateFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Select
                value={selectedDateFilter}
                onValueChange={setSelectedDateFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  {dateFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} found
          </p>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleEventClick(event.id)}
            >
              <div className="relative">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {isEventSoon(event.date) && (
                    <Badge variant="default" className="bg-red-500">
                      Soon
                    </Badge>
                  )}
                  {event.isOnline && <Badge variant="secondary">Online</Badge>}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {event.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {formatTime(event.date)} - {formatTime(event.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {event.attendees}/{event.maxAttendees}
                        </span>
                      </div>
                      <div className="font-semibold">
                        {event.price === 0 ? "Free" : `$${event.price}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    by {event.organizer}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events Found</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Stay Tuned
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
