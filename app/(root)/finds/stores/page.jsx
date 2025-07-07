import { Suspense } from "react";
import { fetchAllShops } from "@lib/actions/shops.prisma";
import { shopCategories } from "@constants/arrays";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import StoresPageSkeleton from "@components/shop/id/stores-page-skeleton";
import StoresPageClient from "@components/shop/id/stores-page-client";

export default async function StoresPage({ searchParams }) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  // Prefetch stores data on the server
  await queryClient.prefetchQuery({
    queryKey: ["allStores"],
    queryFn: fetchAllShops,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6 space-y-2">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-muted-foreground">
            Discover campus online stores and vendors
          </p>
        </div>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<StoresPageSkeleton />}>
          <StoresPageClient
            initialSearch={params.search || ""}
            initialCategory={params.category || "All categories"}
            categories={shopCategories}
          />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category;

  let title = "Find Stores - Discover Campus Shops";
  let description =
    "Discover campus shops and vendors with our comprehensive store directory.";

  if (search) {
    title = `Search: "${search}" - Find Stores`;
    description = `Search results for "${search}" in our campus store directory.`;
  }

  if (category && category !== "All categories") {
    title = `${category} Stores - Find Stores`;
    description = `Browse ${category} stores and vendors on campus.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
