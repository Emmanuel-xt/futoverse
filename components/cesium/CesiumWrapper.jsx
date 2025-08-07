"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CesiumMapB from "./Cesium";

export default function CesiumMapBWrapper() {
  const pathname = usePathname();
  const isMapPage = pathname === "/map";

  const [showOverlay, setShowOverlay] = useState(true);
  const [showDismissButton, setShowDismissButton] = useState(false);

  useEffect(() => {
    if (isMapPage) {
      const timer = setTimeout(() => {
        setShowDismissButton(true);
      }, 5000); // show dismiss button after 5 secs
      return () => clearTimeout(timer);
    }
  }, [isMapPage]);

  const handleDismiss = () => {
    setShowOverlay(false);
  };

  return (
    <div id="cesium-map-wrapper" className="relative w-full h-full">
      {isMapPage && <CesiumMapB />}

      {isMapPage && showOverlay && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity flex flex-col items-center justify-center text-white transition-opacity">
          <p className="text-xl mb-4 text-center max-w-md px-4">
            Loading 3D Map... This may take a few seconds depending on your
            network. Please wait.
          </p>
          {showDismissButton ? (
            <button
              onClick={handleDismiss}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition"
            >
              Enter Map
            </button>
          ) : (
            <p className="text-sm mt-4 opacity-60">Preparing map view...</p>
          )}
        </div>
      )}
    </div>
  );
}
