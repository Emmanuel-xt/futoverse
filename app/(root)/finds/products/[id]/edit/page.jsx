import { notFound, redirect } from "next/navigation";
import { fetchProductById } from "@lib/actions/product.prisma";
import { EditProductForm } from "@components/products/edit-product-form";
// import { BackButton } from "@components/ui/back-button";
import { auth } from "auth";

async function getProduct(id, userId) {
  try {
    const product = await fetchProductById(decodeURIComponent(id));
    if (!product) {
      notFound();
    }

    // Check if user owns the product
    if (product.userId !== userId) {
      redirect("/products");
    }

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }
}

export default async function EditProductPage({ params }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const product = await getProduct(params.id, session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
              <BackButton />
            </div>

            <div className="max-w-4xl mx-auto">
              <EditProductForm product={product} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Product
            </h1>
            <EditProductForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Edit Product",
  description: "Edit your product details and information.",
};
