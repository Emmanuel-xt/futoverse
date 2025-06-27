import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { Package, Tag, User, MapPin } from "lucide-react";

export function ProductDetails({ product }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 mb-4">
          {product.category && (
            <Badge variant="secondary">
              <Tag className="h-3 w-3 mr-1" />
              {product.category}
            </Badge>
          )}
          <Badge variant="outline">
            <Package className="h-3 w-3 mr-1" />
            {product.quantity} in stock
          </Badge>
        </div>
      </div>

      <div className="text-4xl font-bold text-green-600">
        ₦{Number.parseFloat(product.price).toLocaleString()}
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {product.description}
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {product.shop && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Shop</p>
              <p className="text-sm text-gray-600">{product.shop.name}</p>
            </div>
          </div>
        )}

        {product.user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Seller</p>
              <p className="text-sm text-gray-600">{product.user.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
