"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

// interface SearchDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   categories: readonly any[]
//   onCategorySelect: (categoryId: string) => void
// }

export const SearchDrawer = ({
  open,
  onOpenChange,
  categories,
  onCategorySelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.filter((category) =>
      category.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, categories]);

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">
              Search Everything
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories Grid */}
          <div>
            <h3 className="text-lg font-medium mb-4">Browse Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 border-transparent transition-all hover:scale-105",
                      category.color,
                      "hover:border-gray-200"
                    )}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Searches */}
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {["Library", "Cafeteria", "Parking", "ATM"].map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
