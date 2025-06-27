import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@components/ui/badge";

export function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <Link href={`/finds/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image || "/images/noProfile.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product.category && (
            <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700">
              {product.category}
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">
              ₦{Number.parseFloat(product.price).toLocaleString()}
            </span>

            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm text-gray-600 ml-1">4.5</span>
            </div>
          </div>

          {product.shop && (
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{product.shop.name}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
