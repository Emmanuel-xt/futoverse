"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Optionally log error for developers
    console.error("Global Error:", error);
  }, [error]);

  const handleRetry = () => {
    // You could also use router.refresh() if using Next router
    window.location.reload(); // hard reload the page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-md border border-red-200">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-red-600">
            Something Went Wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            We're sorry, an unexpected error occurred. You can try again below.
          </p>
          <Button
            onClick={handleRetry}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Try Again
          </Button>
          <p className="text-sm text-gray-400 mt-2">
            If the issue persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
