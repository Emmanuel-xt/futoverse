"use client";

import { X } from "lucide-react";
import useImageModal from "hooks/useImageModal";
import Image from "next/image";

const ImageModal = () => {
  const { isOpen, imageUrl, closeModal } = useImageModal();

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={closeModal} // Clicking anywhere closes...
    >
      <div
        className="relative max-w-full max-h-full border"
        onClick={(e) => e.stopPropagation()} // ...except inside modal
      >
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          <X size={28} />
        </button>
        <Image
          src={imageUrl}
          alt="Enlarged Profile"
          width={200}
          height={200}
          className="rounded-lg max-h-[80vh] max-w-[80vw] object-contain"
        />
      </div>
    </div>
  );
};

export default ImageModal;
