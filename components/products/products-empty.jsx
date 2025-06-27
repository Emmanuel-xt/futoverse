"use client";

import { Package, Search } from "lucide-react";
import { Button } from "@components/ui/button";
import Link from "next/link";

export function ProductsEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn't find any products matching your search criteria. Try
        adjusting your filters or search terms.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/products")}
        >
          <Search className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
        <Button asChild>
          <Link href="/products/create">Add New Product</Link>
        </Button>
      </div>
    </div>
  );
}
