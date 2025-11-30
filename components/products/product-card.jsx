import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, ShoppingCart } from "lucide-react";

export function ProductCard({ product }) {
  return (
    <Link href={`/finds/products/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image || "/images/noProfile.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <div className="text-blue-600 font-bold text-lg mb-2">
            ₦{Number.parseFloat(product.price).toLocaleString()}
          </div>

          <h3 className="font-semibold text-gray-700 text-sm uppercase line-clamp-2 mb-3">
            {product.name}
          </h3>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2 mb-3 transition-colors duration-200">
            <ShoppingCart className="h-4 w-4" />
            Buy
          </button>

          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>5</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>2D</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
