"use client";

import CesiumMapB from "@components/cesium/Cesium";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useEffect, useState } from "react";

const MapPage = () => {
  const { viewerReady, setMapVisible } = useCesiumViewer();
  const [mapLoadingMessage, setMapLoadingMessage] = useState("");

  useEffect(() => {
    if (viewerReady) {
      setMapVisible(true);
    } else {
      setMapLoadingMessage("Loading the 3D map, please wait...");
    }
  }, [viewerReady, setMapVisible]);

  return (
    <div className="p-6">
      {!viewerReady && (
        <p className="font-bold text-3xl text-center">{mapLoadingMessage}</p>
      )}
      {/* <CesiumMapB /> */}
      {/* No need to render CesiumMapB here, it's already in the layout */}
    </div>
  );
};

export default MapPage;
