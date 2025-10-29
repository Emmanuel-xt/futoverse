"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { getRecentProducts } from "@lib/actions/product.prisma";

export function ProductsHomeRow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getRecentProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-background border-b border-border py-4 px-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-64 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-background border-b border-border py-4">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Shop</h3>
        </div>
        <Link
          href="/finds/products"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          See all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto px-4">
        <div className="flex gap-4 pb-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="flex-shrink-0 w-48 group cursor-pointer"
            >
              <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden mb-3">
                <Image
                  src={
                    product.image ||
                    "/placeholder.svg?height=192&width=192&query=product"
                  }
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {product.tag && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {product.tag}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-sm">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.shop && (
                    <span className="text-xs text-muted-foreground">
                      {product.shop.name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
