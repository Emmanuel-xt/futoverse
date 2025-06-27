"use client";

import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Search, Filter } from "lucide-react";

export default function SearchFilters({
  searchQuery,
  selectedCategory,
  showFilters,
  categories,
  onSearchChange,
  onCategoryChange,
  onToggleFilters,
  onClearFilters,
}) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search stores by name, description, or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleFilters}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        {selectedCategory !== "All categories" && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="max-w-xs">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
        </div>
      )}
    </div>
  );
}
