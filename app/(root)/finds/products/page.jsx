import { Suspense } from "react";
import { ProductsGrid } from "@components/products/products-grid";
import { ProductsFilters } from "@components/products/products-filters";
import { ProductsSearch } from "@components/products/products-search";
import { ProductsLoading } from "@components/products/products-loading";

// Revalidate products page every 60 seconds (1 minute)
export const revalidate = 60;

export default function ProductsPage({ searchParams }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl text-center text-primary font-bold mb-2">
            Market Place
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {/* <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <ProductsFilters />
            </div>
          </div> */}

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <ProductsSearch />
            </div>

            <Suspense fallback={<ProductsLoading />}>
              <ProductsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Products - Find Amazing Local Products",
  description:
    "Browse and discover products from local vendors with advanced search and filtering options.",
};
