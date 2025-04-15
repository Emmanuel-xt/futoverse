"use client";

import { useRouter } from "next/navigation";
import { User, Store, ShoppingBag } from "lucide-react"; // example icons
import React from "react";

const searchOptions = [
  {
    label: "Find Users",
    icon: <User size={28} className="text-primary" />,
    route: "/users",
  },
  {
    label: "Find Stores",
    icon: <Store size={28} className="text-primary" />,
    route: "/shops",
  },
  {
    label: "Find Products",
    icon: <ShoppingBag size={28} className="text-primary" />,
    route: "/products",
  },
  // Add more options here if needed
];

const FindPage = () => {
  const router = useRouter();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        What are you looking for?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
        {searchOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => router.push(option.route)}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer bg-white"
          >
            <div className="p-2 bg-primary/10 rounded-full">{option.icon}</div>
            <span className="font-medium text-gray-800">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindPage;
