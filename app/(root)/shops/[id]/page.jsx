import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopPageSkeleton from "@components/shop/shop-page-skeleton";
import ShopPageClient from "@components/shop/shop-page-client";

// interface ShopPageProps {
//   params: Promise<{ id: string }>
// }

export default async function ShopPage({ params }) {
  const { id } = await params;
  const shopId = decodeURIComponent(id);

  // Basic validation
  if (!shopId || shopId.trim() === "") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<ShopPageSkeleton />}>
        <ShopPageClient shopId={shopId} />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const shopId = decodeURIComponent(id);

  return {
    title: `${shopId} - Shop Details`,
    description: `View products and details for ${shopId}`,
  };
}
