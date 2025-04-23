"use client";

import { useEffect } from "react";

// Global error handler component
export default function GlobalError({ error, reset }) {
  // Optional: Log the error for debugging
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center h-screen bg-white text-center">
        <div className="max-w-md px-4 py-6">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Oops! Something went wrong.
          </h2>
          <p className="text-lg text-gray-500 mb-6">
            We encountered an issue on our end. Please try again later or
            refresh the page.
          </p>
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
            onClick={() => reset()} // Retry button to reset the error
          >
            Try Again
          </button>
          <p className="mt-4 text-sm text-gray-400">
            If the issue persists, please contact support.
          </p>
        </div>
      </body>
    </html>
  );
}
