import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductDetails } from "@components/products/product-details";
import { ProductActions } from "@components/products/product-actions";
import { ProductImages } from "@components/products/product-images";
import { RelatedProducts } from "@components/products/related-products";
import { fetchProductById } from "@lib/actions/product.prisma";
import { ProductDetailsLoading } from "@components/products/product-details-loading";

async function getProduct(id) {
  try {
    const product = await fetchProductById(decodeURIComponent(id));
    if (!product) {
      notFound();
    }
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* <div className="mb-6">
          <BackButton />
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImages product={product} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <ProductDetails product={product} />
            <Suspense
              fallback={
                <div className="animate-pulse h-20 bg-gray-200 rounded" />
              }
            >
              <ProductActions product={product} />
            </Suspense>
          </div>
        </div>

        {/* Related Products */}
        {/* <Suspense fallback={<ProductDetailsLoading />}>
          <RelatedProducts productId={product.id} category={product.category} />
        </Suspense> */}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} - ₦${product.price}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
