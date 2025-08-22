import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopPageSkeleton from "@components/shop/shop-page-skeleton";
import ShopPageClient from "@components/shop/shop-page-client";
import { fetchUserShopById } from "@lib/actions/shops.prisma";

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

// Generate comprehensive SEO metadata
export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await fetchUserShopById(id);

  if (!result) {
    return {
      title: "Shop Not Found",
      description: "The requested shop could not be found.",
    };
  }

  const shop = result;
  const itemCount = shop.shopItems?.length || 0;
  const hasProducts = itemCount > 0;

  return {
    title: `${shop.name} - ${shop.category} in ${shop.locationDesc.split(" ").slice(-2).join(" ")} | Professional Hair Services`,
    description: `${shop.description} Located at ${shop.locationDesc}. ${hasProducts ? `Browse ${itemCount} products and services.` : "Discover our professional services."} Book your appointment today!`,

    keywords: [
      shop.name,
      shop.category.toLowerCase(),
      shop.locationDesc.toLowerCase(),
    ].join(", "),

    authors: [{ name: shop.name }],

    openGraph: {
      title: `${shop.name} - Professional ${shop.category}`,
      description: `${shop.description} Visit us at ${shop.locationDesc} for expert hair styling, wig services, and more.`,
      type: "website",
      images: [
        {
          url: shop.coverImage || shop.image,
          width: 1200,
          height: 630,
          alt: `${shop.name} - ${shop.category} in ${shop.locationDesc}`,
        },
        ...(shop.image && shop.image !== shop.coverImage
          ? [
              {
                url: shop.image,
                width: 800,
                height: 600,
                alt: `${shop.name} shop interior`,
              },
            ]
          : []),
      ],
      locale: "en_NG",
      siteName: "Local Business Directory",
    },

    twitter: {
      card: "summary_large_image",
      title: `${shop.name} - ${shop.category}`,
      description: `${shop.description} Located in ${shop.locationDesc}`,
      images: [shop.coverImage || shop.image],
    },

    alternates: {
      canonical: `/shops/${id}`,
    },

    other: {
      "business:contact_data:locality": shop.locationDesc,
      "business:contact_data:region": "Imo State",
      "business:contact_data:country_name": "Nigeria",
      "geo.region": "NG-IM",
      "geo.placename": shop.locationDesc,
    },
  };
}
