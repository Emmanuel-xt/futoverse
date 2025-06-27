import { fetchAllProductS } from "@lib/actions/product.prisma";
import { ProductCard } from "./product-card";
import { ProductsEmpty } from "./products-empty";

async function getFilteredProducts(searchParams) {
  const products = await fetchAllProductS();

  let filtered = products;

  // Search filter
  if (searchParams.search) {
    filtered = filtered.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(searchParams.search.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchParams.search.toLowerCase())
    );
  }

  // Price filters
  if (searchParams.minPrice) {
    filtered = filtered.filter(
      (product) =>
        Number.parseFloat(product.price) >=
        Number.parseFloat(searchParams.minPrice)
    );
  }

  if (searchParams.maxPrice) {
    filtered = filtered.filter(
      (product) =>
        Number.parseFloat(product.price) <=
        Number.parseFloat(searchParams.maxPrice)
    );
  }

  // Category filter
  if (searchParams.category && searchParams.category !== "all") {
    filtered = filtered.filter(
      (product) =>
        product.category?.toLowerCase() === searchParams.category.toLowerCase()
    );
  }

  // Sort
  switch (searchParams.sort) {
    case "price-low":
      filtered.sort(
        (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price)
      );
      break;
    case "price-high":
      filtered.sort(
        (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price)
      );
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // Default sort by newest (assuming createdAt exists)
      break;
  }

  return filtered;
}

export async function ProductsGrid({ searchParams }) {
  const products = await getFilteredProducts(searchParams);

  if (products.length === 0) {
    return <ProductsEmpty />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
