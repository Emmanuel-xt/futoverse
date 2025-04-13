// components/cesium/CesiumMapBWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import CesiumMapB from "./Cesium";

export default function CesiumMapBWrapper() {
  const pathname = usePathname();
  const isMapPage = pathname === "/map";

  return (
    <div
      id="cesium-map-wrapper"
      style={{
        display: isMapPage ? "block" : "none",
      }}
    >
      <CesiumMapB />
    </div>
  );
}
