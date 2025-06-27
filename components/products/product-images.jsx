"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { cn } from "@lib/utils";

// interface ProductImagesProps {
//   product: {
//     id: string
//     name: string
//     image: string
//     images?: string[] // Additional product images
//   }
// }

export function ProductImages({ product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  // Combine main image with additional images
  const allImages = [product.image, ...(product.images || [])];
  const hasMultipleImages = allImages.length > 1;

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleZoomPrevious = () => {
    setZoomImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleZoomNext = () => {
    setZoomImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const openZoom = (index) => {
    setZoomImageIndex(index);
    setIsZoomOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image Display */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
          <Image
            src={
              allImages[selectedImageIndex] ||
              "/placeholder.svg?height=500&width=500"
            }
            alt={`${product.name} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />

          {/* Zoom Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => openZoom(selectedImageIndex)}
          >
            <Expand className="h-4 w-4" />
          </Button>

          {/* Navigation Arrows for Multiple Images */}
          {hasMultipleImages && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hasMultipleImages && (
          <div className="grid grid-cols-4 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all",
                  selectedImageIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Image
                  src={image || "/placeholder.svg?height=100&width=100"}
                  alt={`${product.name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setIsZoomOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Zoomed Image */}
            <div className="relative w-full h-full">
              <Image
                src={
                  allImages[zoomImageIndex] ||
                  "/placeholder.svg?height=800&width=800"
                }
                alt={`${product.name} - Zoomed Image ${zoomImageIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation in Zoom */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={handleZoomPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={handleZoomNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image Counter in Zoom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {zoomImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
