import Link from "next/link";
import { fetchAllProducts } from "@lib/actions/product.prisma";
import { Button } from "@components/ui/button";
import { ChevronRight } from "lucide-react";
import { RelatedProductsClient } from "./related-products-client";

// interface RelatedProductsProps {
//   productId: string
//   category?: string
//   shopId?: string
// }

async function getRelatedProducts(productId, category, shopId) {
  try {
    const allProducts = await fetchAllProducts();

    // Filter out the current product
    const relatedProducts = allProducts.filter(
      (product) => product.id !== productId
    );

    // Priority 1: Same category and same shop
    const sameCategoryAndShop = relatedProducts.filter(
      (product) =>
        product.category?.toLowerCase() === category?.toLowerCase() &&
        product.shopId === shopId
    );

    // Priority 2: Same category, different shop
    const sameCategoryDifferentShop = relatedProducts.filter(
      (product) =>
        product.category?.toLowerCase() === category?.toLowerCase() &&
        product.shopId !== shopId
    );

    // Priority 3: Same shop, different category
    const sameShopDifferentCategory = relatedProducts.filter(
      (product) =>
        product.shopId === shopId &&
        product.category?.toLowerCase() !== category?.toLowerCase()
    );

    // Priority 4: Random products
    const otherProducts = relatedProducts.filter(
      (product) =>
        product.category?.toLowerCase() !== category?.toLowerCase() &&
        product.shopId !== shopId
    );

    // Combine in priority order and limit to 12 products
    const prioritizedProducts = [
      ...sameCategoryAndShop.slice(0, 4),
      ...sameCategoryDifferentShop.slice(0, 4),
      ...sameShopDifferentCategory.slice(0, 2),
      ...otherProducts.slice(0, 2),
    ].slice(0, 12);

    return prioritizedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

export async function RelatedProducts({ productId, category, shopId }) {
  const relatedProducts = await getRelatedProducts(productId, category, shopId);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
          <p className="text-gray-600 mt-1">
            You might also like these products
          </p>
        </div>

        {relatedProducts.length > 8 && (
          <Button variant="outline" asChild>
            <Link href={`/products?category=${category?.toLowerCase()}`}>
              View All
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      <RelatedProductsClient products={relatedProducts} />
    </section>
  );
}
