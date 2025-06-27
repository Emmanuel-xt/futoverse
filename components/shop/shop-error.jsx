"use client";

import { Button } from "@components/ui/button";
import { AiOutlineArrowLeft } from "react-icons/ai";

// interface ShopErrorProps {
//   error: any
//   onRetry: () => void
//   onBack: () => void
// }

export default function ShopError({ error, onRetry, onBack }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-6 p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">😞</div>
        <h1 className="text-2xl font-bold text-gray-800">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 max-w-md">
          We couldn't load the shop details. Please check your connection and
          try again.
        </p>
        {error?.message && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Error: {error.message}
          </p>
        )}
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <AiOutlineArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </Button>
        <Button onClick={onRetry} className="flex items-center space-x-2">
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
}
