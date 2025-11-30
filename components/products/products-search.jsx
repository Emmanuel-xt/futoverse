"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import CreateStoreDrawer from "@components/shop/id/create-store-drawer";
import { createStore } from "@lib/actions/shops.prisma";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { shopCategories } from "@constants/arrays";

export function ProductsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  const [debounceTimer, setDebounceTimer] = useState(null);
  const inputRef = useRef(null);
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (newStore) => {
      // Optimistically update the cache
      // queryClient.setQueryData(["allStores"], (oldStores) => [
      //   ...(oldStores || []),
      //   newStore,
      // ]);

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

  const handleCreateStore = useCallback(
    (storeData) => {
      createStoreMutation.mutate({
        ...storeData,
        userId,
      });
    },
    [createStoreMutation, userId]
  );

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      router.push(`?${params.toString()}`);
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  };

  const handleAddStore = () => {
    alert("Add Store functionality coming soon!");
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        {/* Search Input Section */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add Store Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={() => setShowCreateDrawer(true)}
            size="icon"
            className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <span className="text-xs text-gray-600 font-medium">Add Store</span>
        </div>
      </div>

      <CreateStoreDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onCreateStore={handleCreateStore}
        categories={shopCategories}
        isLoading={createStoreMutation.isPending}
        userId={userId}
      />
    </div>
  );
}
