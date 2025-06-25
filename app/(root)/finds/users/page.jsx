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
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Search, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";

// Mock data based on your schema
const mockUsers = [
  {
    id: 1,
    username: "john_doe",
    name: "John Doe",
    displayName: "Johnny",
    picture: "/placeholder.svg?height=40&width=40",
    bio: "Computer Science student passionate about AI",
    department: { name: "Computer Science", initial: "CS" },
    level: { name: "300 Level" },
    isOnline: true,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    username: "jane_smith",
    name: "Jane Smith",
    displayName: "Jane",
    picture: "/placeholder.svg?height=40&width=40",
    bio: "Engineering student and tech enthusiast",
    department: { name: "Electrical Engineering", initial: "EE" },
    level: { name: "400 Level" },
    isOnline: false,
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    username: "mike_wilson",
    name: "Mike Wilson",
    displayName: "Mike",
    picture: "/placeholder.svg?height=40&width=40",
    bio: "Mathematics major, love solving complex problems",
    department: { name: "Mathematics", initial: "MATH" },
    level: { name: "200 Level" },
    isOnline: true,
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    username: "sarah_johnson",
    name: "Sarah Johnson",
    displayName: "Sarah",
    picture: "/placeholder.svg?height=40&width=40",
    bio: "Business Administration student and entrepreneur",
    department: { name: "Business Administration", initial: "BA" },
    level: { name: "300 Level" },
    isOnline: false,
    createdAt: "2024-01-25",
  },
  {
    id: 5,
    username: "alex_brown",
    name: "Alex Brown",
    displayName: "Alex",
    picture: "/placeholder.svg?height=40&width=40",
    bio: "Physics student researching quantum mechanics",
    department: { name: "Physics", initial: "PHY" },
    level: { name: "400 Level" },
    isOnline: true,
    createdAt: "2024-02-05",
  },
];

const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mathematics",
  "Business Administration",
  "Physics",
];

const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("users-list");

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

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedDepartment !== "All departments")
      params.set("department", selectedDepartment);
    if (selectedLevel !== "All levels") params.set("level", selectedLevel);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/users${newUrl}`, { scroll: false });
  }, [searchQuery, selectedDepartment, selectedLevel, router]);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "All departments" ||
        user.department.name === selectedDepartment;

      const matchesLevel =
        selectedLevel === "All levels" || user.level.name === selectedLevel;

      return matchesSearch && matchesDepartment && matchesLevel;
    });
  }, [searchQuery, selectedDepartment, selectedLevel]);

  const handleUserClick = (userId) => {
    saveScrollPosition();
    router.push(`/finds/users/${userId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All departments");
    setSelectedLevel("All levels");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6 space-y-2">
        <Link href="/finds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Find Users</h1>
          <p className="text-muted-foreground">
            Connect with students and peers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                value={selectedDepartment}
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
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All levels">All levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {filteredUsers.map((user) => (
          <Card
            key={user.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleUserClick(user.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={user.picture || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {user.displayName || user.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {user.bio}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {user.department.initial}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.level.name}
                    </Badge>
                    {user.isOnline && (
                      <Badge variant="default" className="text-xs bg-green-500">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No users found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all users
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
