"use client";

import { Button } from "@components/ui/button";

export default function EmptyState({
  searchQuery,
  selectedCategory,
  onClearFilters,
}) {
  const hasFilters =
    searchQuery || (selectedCategory && selectedCategory !== "All categories");

  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-6xl mb-4">🏪</div>
      <h3 className="text-lg font-semibold text-gray-800">No stores found</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {hasFilters
          ? "No stores match your current search criteria. Try adjusting your filters or search terms."
          : "There are no stores available at the moment."}
      </p>
      {hasFilters && (
        <Button variant="ghost" onClick={onClearFilters} className="mt-4">
          Clear all filters
        </Button>
      )}
    </div>
  );
}
