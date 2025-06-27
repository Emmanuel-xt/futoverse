"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchAllShops } from "@lib/actions/shops.prisma";
import { useScrollPosition } from "hooks/use-scroll-position";
import { useDebounce } from "hooks/use-debounce";
import StoresPageSkeleton from "./stores-page-skeleton";
import SearchFilters from "./search-filters";
import StoresGrid from "./stores-grid";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";

export default function StoresPageClient({
  initialSearch,
  initialCategory,
  categories,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("stores-list");

  // State management
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Restore scroll position on mount
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // TanStack Query with enhanced caching strategy
  const {
    data: stores = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allStores"],
    queryFn: async () => {
      console.log("🔄 Fetching all stores...");
      const result = await fetchAllShops();
      console.log(`✅ Fetched ${result.length} stores`);
      return result;
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount}:`, error);
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount since we have prefetched data
  });

  // Update URL params when filters change (debounced)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (selectedCategory && selectedCategory !== "All categories")
      params.set("category", selectedCategory);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/finds/stores${newUrl}`, { scroll: false });
  }, [debouncedSearchQuery, selectedCategory, router]);

  // Memoized filtered stores with performance optimization
  const filteredStores = useMemo(() => {
    if (!stores.length) return [];

    return stores.filter((store) => {
      // Search filter
      const matchesSearch =
        !debouncedSearchQuery ||
        store.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        store.description
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        store.locationDesc
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All categories" ||
        store.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearchQuery, selectedCategory, stores]);

  // Handlers
  const handleStoreClick = useCallback(
    (storeId) => {
      saveScrollPosition();
      router.push(`/shops/${storeId}`);
    },
    [saveScrollPosition, router]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All categories");
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
  }, []);

  // Loading state
  if (isLoading) {
    return <StoresPageSkeleton />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <>
      <SearchFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        showFilters={showFilters}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={clearFilters}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredStores.length} store
            {filteredStores.length !== 1 ? "s" : ""} found
            {isFetching && (
              <span className="ml-2 text-blue-600">(updating...)</span>
            )}
          </p>
        </div>

        {filteredStores.length > 0 ? (
          <StoresGrid stores={filteredStores} onStoreClick={handleStoreClick} />
        ) : (
          <EmptyState
            searchQuery={debouncedSearchQuery}
            selectedCategory={selectedCategory}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </>
  );
}
