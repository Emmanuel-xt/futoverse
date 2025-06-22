"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// interface ImageMessageProps {
//   message: any
// }

const ImageMessage = ({ message }) => {
  const [showFullImage, setShowFullImage] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = message.mediaUrl;
    link.download = message.fileName || "image";
    link.click();
  };

  return (
    <>
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg max-w-xs">
          <Image
            src={message.mediaUrl || "/placeholder.svg"}
            alt="Shared image"
            width={300}
            height={200}
            className="w-full h-auto object-cover cursor-pointer"
            onClick={() => setShowFullImage(true)}
          />

          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullImage(true)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {message.body && <p className="mt-2 text-sm">{message.body}</p>}
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={message.mediaUrl || "/placeholder.svg"}
              alt="Full image"
              width={800}
              height={600}
              className="w-auto h-auto max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowFullImage(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageMessage;
