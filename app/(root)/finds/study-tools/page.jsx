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
  BookOpen,
  Download,
  ExternalLink,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";
import Image from "next/image";

// Mock study tools data
const mockStudyTools = [
  {
    id: 1,
    name: "Calculus Study Guide",
    description:
      "Comprehensive study guide covering all calculus topics with examples and practice problems",
    category: "Study Guides",
    subject: "Mathematics",
    type: "PDF",
    size: "2.5 MB",
    downloads: 1250,
    rating: 4.8,
    reviews: 89,
    author: "Dr. Smith",
    department: "Mathematics Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: true,
    isFree: true,
    tags: ["calculus", "mathematics", "study-guide"],
  },
  {
    id: 2,
    name: "Physics Lab Simulator",
    description:
      "Interactive physics laboratory simulator for conducting virtual experiments",
    category: "Software",
    subject: "Physics",
    type: "Web App",
    size: "N/A",
    downloads: 890,
    rating: 4.6,
    reviews: 67,
    author: "Physics Department",
    department: "Physics Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: false,
    isFree: true,
    tags: ["physics", "simulation", "laboratory"],
  },
  {
    id: 3,
    name: "Programming Cheat Sheets",
    description:
      "Collection of programming language cheat sheets for quick reference",
    category: "Reference",
    subject: "Computer Science",
    type: "PDF Collection",
    size: "15.2 MB",
    downloads: 2100,
    rating: 4.9,
    reviews: 156,
    author: "CS Student Association",
    department: "Computer Science Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: true,
    isFree: true,
    tags: ["programming", "reference", "cheat-sheet"],
  },
  {
    id: 4,
    name: "Chemistry Formula Database",
    description:
      "Searchable database of chemical formulas, reactions, and properties",
    category: "Database",
    subject: "Chemistry",
    type: "Web App",
    size: "N/A",
    downloads: 567,
    rating: 4.4,
    reviews: 43,
    author: "Dr. Johnson",
    department: "Chemistry Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: false,
    isFree: true,
    tags: ["chemistry", "formulas", "database"],
  },
  {
    id: 5,
    name: "Essay Writing Templates",
    description:
      "Professional essay templates and writing guidelines for academic papers",
    category: "Templates",
    subject: "English",
    type: "Word Documents",
    size: "5.8 MB",
    downloads: 1450,
    rating: 4.7,
    reviews: 98,
    author: "Writing Center",
    department: "English Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: true,
    isFree: true,
    tags: ["writing", "essays", "templates"],
  },
  {
    id: 6,
    name: "Statistical Analysis Tool",
    description:
      "Online tool for performing statistical analysis and data visualization",
    category: "Software",
    subject: "Statistics",
    type: "Web App",
    size: "N/A",
    downloads: 723,
    rating: 4.5,
    reviews: 52,
    author: "Statistics Department",
    department: "Mathematics Department",
    image: "/placeholder.svg?height=200&width=200",
    url: "#",
    isDownloadable: false,
    isFree: false,
    tags: ["statistics", "analysis", "visualization"],
  },
];

const categories = [
  "Study Guides",
  "Software",
  "Reference",
  "Database",
  "Templates",
  "Videos",
];

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "English",
  "Statistics",
  "Biology",
  "Engineering",
];

const types = ["PDF", "Web App", "Software", "Video", "Audio", "Document"];

export default function StudyToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("tools-list");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All categories"
  );
  const [selectedSubject, setSelectedSubject] = useState(
    searchParams.get("subject") || "All subjects"
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "All types"
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
    if (selectedCategory !== "All categories")
      params.set("category", selectedCategory);
    if (selectedSubject !== "All subjects")
      params.set("subject", selectedSubject);
    if (selectedType !== "All types") params.set("type", selectedType);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/study-tools${newUrl}`, { scroll: false });
  }, [searchQuery, selectedCategory, selectedSubject, selectedType, router]);

  const filteredTools = useMemo(() => {
    return mockStudyTools
      .filter((tool) => {
        const matchesSearch =
          !searchQuery ||
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesCategory =
          !selectedCategory || tool.category === selectedCategory;
        const matchesSubject =
          !selectedSubject || tool.subject === selectedSubject;
        const matchesType = !selectedType || tool.type === selectedType;

        return (
          matchesSearch && matchesCategory && matchesSubject && matchesType
        );
      })
      .sort((a, b) => b.rating - a.rating);
  }, [searchQuery, selectedCategory, selectedSubject, selectedType]);

  const handleToolClick = (toolId) => {
    saveScrollPosition();
    router.push(`/finds/study-tools/${toolId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All categories");
    setSelectedSubject("All subjects");
    setSelectedType("All types");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDownloads = (downloads) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/finds">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Find Study Tools</h1>
          <p className="text-muted-foreground">
            Access learning resources and tools
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tools by name, description, or tags..."
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
          {(selectedCategory !== "All categories" ||
            selectedSubject !== "All subjects" ||
            selectedType !== "All types") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
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
                  <SelectItem value="All categories">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All subjects">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All types">All types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleToolClick(tool.id)}
            >
              <div className="relative">
                <Image
                  src={tool.image || "/placeholder.svg"}
                  alt={tool.name}
                  width={200}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {tool.isFree ? (
                    <Badge variant="default" className="bg-green-500">
                      Free
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-blue-500">
                      Premium
                    </Badge>
                  )}
                  {tool.isDownloadable && (
                    <Badge variant="secondary">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tool.subject}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {renderStars(tool.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      {tool.rating} ({tool.reviews})
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{tool.type}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatDownloads(tool.downloads)} downloads
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      by {tool.author}
                    </span>
                    <div className="flex gap-1">
                      {tool.isDownloadable ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No study tools found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all tools
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
