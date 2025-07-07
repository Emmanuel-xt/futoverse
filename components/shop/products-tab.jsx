"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProductsTab({ shopItems }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems =
    searchTerm.trim() === ""
      ? shopItems
      : shopItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="p-4">
      {filteredItems.length !== 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredItems.map((product, index) => (
            <Link
              href={`/finds/products/${product.id}`}
              key={index}
              className="bg-slate-100 border p-2 rounded shadow-sm h-24 relative hover:shadow-md transition-shadow"
            >
              <Image
                src={product.image || "/placeholder.svg"}
                alt="Product"
                fill
                className="object-contain rounded"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-700 text-lg py-8">
          No Products Found
        </div>
      )}
    </div>
  );
}
