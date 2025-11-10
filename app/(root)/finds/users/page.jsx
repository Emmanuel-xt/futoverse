"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { fetchAllUsers } from "@lib/actions/user.prisma";
import { useSession } from "next-auth/react";
// import { departments } from "@constants/departments";
import Image from "next/image";
import { departments } from "@constants/arrays";
import { useScrollPosition } from "hooks/use-scroll-position";
import { Skeleton } from "@components/ui/skeleton";

// 🧪 Replace with real server fetch later

const levels = [
  { name: "100" },
  { name: "200" },
  { name: "300" },
  { name: "400" },
  { name: "500" },
  { name: "600" },
  { name: "Alumni" },
  { name: "Others" },
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    searchParams.get("department") || "All departments"
  );
  const [selectedLevel, setSelectedLevel] = useState(
    searchParams.get("level") || "All levels"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const observerRef = useRef(null);
  const { data: session } = useSession();
  const currentUserId = Number(session?.user?.id);

  const {
    saveScrollPosition,
    restoreScrollPosition,
    savePage,
    restorePage,
    clear,
  } = useScrollPosition("users-page");

  const {
    data: allUsers = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["allUsers", currentUserId || "key"],
    queryFn: () => fetchAllUsers(currentUserId || 1416),
    enabled: true,
    // refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // staleTime: Infinity,
  });

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedDepartment !== "All departments")
      params.set("department", selectedDepartment);
    if (selectedLevel !== "All levels") params.set("level", selectedLevel);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/users${newUrl}`, { scroll: false });
  }, [searchQuery, selectedDepartment, selectedLevel]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All departments" ||
        user?.department?.name === selectedDepartment;

      const matchesLevel =
        selectedLevel === "All levels" || user?.level?.name === selectedLevel;

      return matchesSearch && matchesDepartment && matchesLevel;
    });
  }, [allUsers, searchQuery, selectedDepartment, selectedLevel]);

  // Paginate displayed users (only when not searching)
  const displayedUsers = useMemo(() => {
    return searchQuery
      ? filteredUsers
      : filteredUsers.slice(0, page * pageSize);
  }, [filteredUsers, page, searchQuery]);

  // Infinite scroll (disabled when searching)
  useEffect(() => {
    if (searchQuery) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [searchQuery]);

  const handleUserClick = (username) => {
    saveScrollPosition();
    savePage(page);
    router.push(`/finds/users/${username}`);
  };

  // On mount
  useEffect(() => {
    const restoredPage = restorePage();
    setPage(restoredPage);
    restoreScrollPosition();
    clear(); // Clean up after restoring
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All departments");
    setSelectedLevel("All levels");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6 space-y-2">
        <div>
          <h1 className="text-2xl font-bold">Find Users</h1>
          <p className="text-muted-foreground">
            Connect with students and peers
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by name, username, or bio..."
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
          {(selectedDepartment !== "All departments" ||
            selectedLevel !== "All levels") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Department
              </label>
              <Select
                value={selectedDepartment.name}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All departments">
                    All departments
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.initial} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select
                value={selectedLevel.name}
                onValueChange={setSelectedLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All levels">All levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.name} value={level.name}>
                      {level.name}
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
        {/* <p className="text-sm text-muted-foreground">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
          found
        </p> */}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4 h-4" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 space-y-4">
            <div className="text-red-600 text-sm font-medium">
              Failed to load users. Please check your connection and try again.
            </div>
            <Button
              variant="default"
              onClick={refetch}
              disabled={isFetching}
              className="flex items-center gap-2 mx-auto"
            >
              {isFetching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </div>
        )}

        {displayedUsers.map((user) => (
          <div
            className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg"
            key={user.id}
          >
            <button
              onClick={() => handleUserClick(user.username)}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={user.picture || "/images/noProfile.png"}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <button
                onClick={() => handleUserClick(user.username)}
                className="text-left w-full"
              >
                <h4 className="font-semibold text-sm truncate">{user.name}</h4>
                <p className="text-xs text-gray-600 truncate">
                  {user.department?.initial}{" "}
                  {user.level?.name && `(${user.level.name}lvl)`}
                </p>
              </button>
            </div>
          </div>
        ))}

        {!displayedUsers.length && !isLoading && !isError && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No user found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all users
            </Button>
          </div>
        )}

        {!searchQuery && <div ref={observerRef} className="h-8" />}
      </div>
    </div>
  );
}
