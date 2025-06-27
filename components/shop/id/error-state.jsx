"use client";

import { Button } from "@components/ui/button";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-600">
        Failed to load stores
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        We encountered an error while loading the stores. Please check your
        connection and try again.
      </p>
      {error?.message && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded max-w-md mx-auto">
          {error.message}
        </p>
      )}
      <Button onClick={onRetry} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
