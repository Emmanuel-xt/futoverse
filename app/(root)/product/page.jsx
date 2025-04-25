"use client";

import Image from "next/image";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAllProductS } from "@lib/actions/product.prisma";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flytoDestination } from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Track loading
  const [hasFetched, setHasFetched] = useState(false); // Track if fetch has been completed

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const all = await fetchAllProductS();
      setAllProducts(all);
      setProducts(all);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const router = useRouter();
  const { viewer } = useCesiumViewer();

  const pushToRelativeMap = (lon, lat) => {
    router.push("/map");
    flytoDestination(viewer, lon, lat);
  };

  useEffect(() => {
    if (!searchTerm) {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
    }
  }, [searchTerm, allProducts]);

  const renderProducts = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-gray-500 animate-pulse">Loading products...</div>
        </div>
      );
    }

    if (hasFetched && products.length === 0) {
      return (
        <div className="text-center text-gray-500 min-h-[300px]">
          <p className="text-lg">😕 No products found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <>
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="border rounded-lg p-2 relative shadow-sm"
            >
              <Image
                src={product.image || "/images/noProfile.png"}
                alt={product.name}
                width={200}
                height={150}
                className="w-full h-32 object-contain rounded"
              />

              <div className="text-green-600 font-semibold mt-2">
                ₦{product.price}
              </div>
              <div className="text-sm font-medium line-clamp-2">
                {product.name}
              </div>
            </Link>
            <div
              className="flex gap-1 item-center mt-1 text-xs border px-2 py-1 rounded-full bg-gray-100"
              onClick={() =>
                pushToRelativeMap(product.shop.longitude, product.shop.latitude)
              }
            >
              <MapPin size={14} /> {"View Location"}
            </div>
          </>
        ))}
      </div>
    );
  };

  return (
    <div className="p-2 bg-white min-h-screen pb-14">
      <div className="flex items-center gap-2 border rounded-full px-4 py-2 mb-4">
        <Search size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products"
          className="flex-1 outline-none"
        />
      </div>
      <h5 className="font-semibold text-2xl mb-4">Products </h5>

      {/* <div className="flex gap-2 overflow-x-auto mb-4 whitespace-nowrap text-sm">
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          All filters <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Region <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Price, ₦ <ChevronDown size={14} />
        </button>
        <button className="border px-3 py-1 rounded-full flex items-center gap-1">
          Type <ChevronDown size={14} />
        </button>
      </div> */}

      {renderProducts()}

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t grid grid-cols-5 text-xs text-center py-2">
        <div>Home</div>
        <div>Saved</div>
        <div>Sell</div>
        <div>Messages</div>
        <div>Profile</div>
      </nav>
    </div>
  );
}
