"use client";

import { useState } from "react";
import { ProductCard } from "./product-card";
import { Button } from "@components/ui/button";

// interface RelatedProductsClientProps {
//   products: Array<{
//     id: string
//     name: string
//     price: string
//     image: string
//     description?: string
//     category?: string
//     shop?: {
//       name: string
//       longitude: number
//       latitude: number
//     }
//   }>
// }

export function RelatedProductsClient({ products }) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 8;
  const displayedProducts = showAll
    ? products
    : products.slice(0, initialCount);
  const hasMore = products.length > initialCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="px-8"
          >
            Show More Products ({products.length - initialCount} more)
          </Button>
        </div>
      )}
    </div>
  );
}
