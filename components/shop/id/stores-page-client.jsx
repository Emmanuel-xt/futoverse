"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore, fetchAllShops } from "@lib/actions/shops.prisma";
// import { createStore } from "@lib/actions/create-store";
import { useScrollPosition } from "hooks/use-scroll-position";
import { useDebounce } from "hooks/use-debounce";
import { Button } from "@components/ui/button";
import { Plus } from "lucide-react";
import StoresPageSkeleton from "./stores-page-skeleton";
import SearchFilters from "./search-filters";
import StoresGrid from "./stores-grid";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";
import CreateStoreDrawer from "./create-store-drawer";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function StoresPageClient({
  initialSearch,
  initialCategory,
  categories,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { saveScrollPosition, restoreScrollPosition } =
    useScrollPosition("stores-list");

  const { data: session } = useSession();
  const userId = Number(session?.user?.id) || null;

  // State management
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

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

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (newStore) => {
      // Optimistically update the cache
      queryClient.setQueryData(["allStores"], (oldStores) => [
        ...(oldStores || []),
        newStore,
      ]);

      toast.success("Store created successfully!");
      setShowCreateDrawer(false);

      // Navigate to the new store
      router.push(`/shops/${newStore.id}`);
    },
    onError: (error) => {
      console.error("Failed to create store:", error);
      toast.error("Failed to create store. Please try again.");
    },
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

  const handleCreateStore = useCallback(
    (storeData) => {
      createStoreMutation.mutate({
        ...storeData,
        userId,
      });
    },
    [createStoreMutation, userId]
  );

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
          {userId && (
            <Button
              onClick={() => setShowCreateDrawer(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Button>
          )}
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

      <CreateStoreDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onCreateStore={handleCreateStore}
        categories={categories}
        isLoading={createStoreMutation.isPending}
        userId={userId}
      />
    </>
  );
}
