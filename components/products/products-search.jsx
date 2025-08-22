"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";

export function ProductsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const handleSearch = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/finds/products?${params.toString()}`);
    });
  };

  const handleSort = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "default") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchTerm);
            }
          }}
          className="pl-10"
          disabled={isPending}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleSearch(searchTerm)}
          disabled={isPending}
          className="px-6"
        >
          {isPending ? "Searching..." : "Search"}
        </Button>

        {/* <Select
          onValueChange={handleSort}
          defaultValue={searchParams.get("sort") || "default"}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select> */}
      </div>
    </div>
  );
}
