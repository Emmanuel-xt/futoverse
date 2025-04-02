"use client";
import { useState } from "react";

const dummyProducts = [
  { id: 1, title: "MacBook Pro 14", price: "AED4,500", image: "/assets/IceHomeImage1.jpg" },
  { id: 2, title: "Mercedes Benz C200", price: "AED30,000", image: "/assets/logo.svg" },
  { id: 3, title: "Samsung Galaxy S23", price: "AED2,500", image: "/assets/IceHomeImage1.jpg" },
  { id: 4, title: "Electric Bike", price: "AED800", image: "/assets/logo.svg" },
  { id: 5, title: "55-inch OLED TV", price: "AED3,200", image: "/assets/IceHomeImage1.jpg" },
  { id: 6, title: "Convertible Sports Car", price: "AED60,000", image: "/assets/logo.svg" },
];

const Marketplace = () => {
  const [products, setProducts] = useState(dummyProducts);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Marketplace</h2>
        <button className="text-gray-600 text-lg">🔍</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white cursor-pointer rounded-lg overflow-hidden shadow">
            <img src={product.image} alt={product.title} className="w-full h-40 object-cover" />
            <div className="p-2">
              <p className="font-bold">{product.price}</p>
              <p className="text-sm text-gray-700 truncate">{product.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
