"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventCard from "./event-card";
import EventFilters from "./event-filters";

export default function EventsClient({ initialEvents, initialSearchParams }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    initialSearchParams.search || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialSearchParams.category || "all"
  );
  const [selectedDateFilter, setSelectedDateFilter] = useState(
    initialSearchParams.date || "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedDateFilter !== "all") params.set("date", selectedDateFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    // router.replace(`/events${newUrl}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedDateFilter, router]);

  // Get unique categories from events
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        initialEvents
          .map((event) => event.category)
          .filter((cat) => cat && cat.trim() !== "")
      )
    );
    return cats.sort();
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return initialEvents
      .filter((event) => {
        const eventDate = new Date(event.date);

        // Search filter
        const matchesSearch =
          !searchQuery ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Category filter
        const matchesCategory =
          selectedCategory === "all" ||
          event.category === selectedCategory ||
          (selectedCategory === "uncategorized" &&
            (!event.category || event.category.trim() === ""));

        // Date filter
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
  }, [initialEvents, searchQuery, selectedCategory, selectedDateFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDateFilter("all");
  };

  return (
    <div className="space-y-6">
      <EventFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDateFilter={selectedDateFilter}
        setSelectedDateFilter={setSelectedDateFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        categories={categories}
        clearFilters={clearFilters}
      />

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id || index} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ||
              selectedCategory !== "all" ||
              selectedDateFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Stay tuned for upcoming events"}
            </p>
            {(searchQuery ||
              selectedCategory !== "all" ||
              selectedDateFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
