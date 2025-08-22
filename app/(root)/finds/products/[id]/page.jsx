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

  const formattedPrice = `₦${product.price.toLocaleString()}`;
  const shopName = product.shop.name;
  const sellerName = product.user.name;

  // Create compelling title and description
  const title = `${product.name} - ${formattedPrice} | Premium Quality at ${shopName}`;
  const description = `🔥 Get your hands on these premium ${product.name} for just ${formattedPrice}! ${product.description.replace(/\n/g, " ")} Available now at ${shopName} by ${sellerName}. Limited stock - Order today!`;

  // Extract key features for keywords
  const keywords = [product.name.toLowerCase(), shopName.toLowerCase()];

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: sellerName, url: `/@${product.user.username}` }],
    creator: sellerName,
    publisher: shopName,

    openGraph: {
      title: `🛍️ ${product.name} - Premium Quality ${formattedPrice}`,
      description: `Discover premium ${product.name} at ${shopName}! ${product.description.replace(/\n/g, " ")} Perfect quality, unbeatable price. Shop now!`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: `${product.name} - Premium quality footwear from ${shopName}`,
        },
      ],
      type: "website",
      siteName: shopName,
      locale: "en_US",
    },

    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${formattedPrice} at ${shopName}`,
      description: `Premium ${product.name} available now! ${product.description.replace(/\n/g, " ")} Shop at ${shopName} 🛒`,
      images: [product.image],
      creator: `@${product.user.username}`,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical: `/product/${product.id}`,
    },

    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "NGN",
      "product:availability":
        product.quantity > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:retailer": shopName,
    },
  };
}
