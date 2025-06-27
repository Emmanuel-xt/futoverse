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
import { Search, Filter, ArrowLeft, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollPosition } from "hooks/use-scroll-position";
import Image from "next/image";
import { shopCategories } from "@constants/arrays";
import { useQuery } from "@tanstack/react-query";
import { fetchAllShops } from "@lib/actions/shops.prisma";
import { Skeleton } from "@components/ui/skeleton";

export default function StoresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("stores-list");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All categories"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  const {
    data: stores = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["allStores"],
    queryFn: () => fetchAllShops(),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory && selectedCategory !== "All categories")
      params.set("category", selectedCategory);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/stores${newUrl}`, { scroll: false });
  }, [searchQuery, selectedCategory, router]);

  const filteredStores = useMemo(() => {
    if (isLoading || !stores.length) return [];

    return stores.filter((store) => {
      const matchesSearch =
        !searchQuery ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.locationDesc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All categories" ||
        store.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, stores]);

  const handleStoreClick = (storeId) => {
    saveScrollPosition();
    router.push(`/shops/${storeId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All categories");
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 space-y-2">
        <div>
          <h1 className="text-2xl font-bold">Find Stores</h1>
          <p className="text-muted-foreground">
            Discover campus shops and vendors
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stores by name, description, or location..."
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
          {selectedCategory !== "All categories" && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="max-w-xs">
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
                  {shopCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
            {filteredStores.length} store
            {filteredStores.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="p-4 space-y-4 animate-pulse">
                <div className="bg-muted rounded-lg h-48 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 space-y-4">
            <div className="text-red-600 text-sm font-medium">
              Failed to load stores. Please check your connection and try again.
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

        {!isLoading && !isError && filteredStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleStoreClick(store.name)}
              >
                <div className="relative">
                  <Image
                    src={store.image || "/images/noStore.png"}
                    alt={store.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-contain rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={store.isOpen ? "default" : "secondary"}
                      className={store.isOpen ? "bg-green-500" : ""}
                    >
                      {store.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {store.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {renderStars(store.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        {store.rating} ({store.reviewCount})
                      </span>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {store.category}
                    </Badge>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {store.description}
                    </p>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {store?.locationDesc}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No stores found matching your criteria.
            </p>
            <Button variant="ghost" onClick={clearFilters} className="mt-2">
              Clear filters to see all stores
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
