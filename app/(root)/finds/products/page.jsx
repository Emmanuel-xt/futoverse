import { Suspense } from "react";
import { ProductsGrid } from "@components/products/products-grid";
import { ProductsFilters } from "@components/products/products-filters";
import { ProductsSearch } from "@components/products/products-search";
import { ProductsLoading } from "@components/products/products-loading";

export default function ProductsPage({ searchParams }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            Discover amazing products from local vendors
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <ProductsFilters />
            </div>
          </div>

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
