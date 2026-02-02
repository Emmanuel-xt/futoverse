"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";

// Cesium is now dynamically imported only when the map becomes visible
// This saves ~2.5MB from the initial bundle, making the app load faster

const CesiumViewerContext = createContext(null);

export const useCesiumViewer = () => useContext(CesiumViewerContext);

export const CesiumViewerProvider = ({ children }) => {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only load Cesium when the map becomes visible
    if (!isMapVisible) return;
    // Don't reinitialize if already ready
    if (viewerRef.current) return;

    let destroyed = false;

    const initializeViewer = async () => {
      try {
        if (typeof window === "undefined") return;

        setIsLoading(true);

        // Dynamic import - Cesium only loads when user actually opens the map
        const Cesium = await import("cesium");

        if (destroyed) return;

        Cesium.Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGNkMDgyYy1jZWQ5LTRkZjktODc5NS01YmYwOWU2YjQ4ZmUiLCJpZCI6MjA1NDMyLCJpYXQiOjE3MTE3NzUxNTV9.2JgatZJRPURzsB8ZytMKxqfjvF53JCkLbbnj90x63_A";

        const cesiumViewer = new Cesium.Viewer("cesiumContainer", {
          baseLayerPicker: false,
          fullscreenButton: false,
          vrButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
        });

        const googleMapsProvider = new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 20,
        });

        cesiumViewer.imageryLayers.removeAll();
        cesiumViewer.imageryLayers.addImageryProvider(googleMapsProvider);

        // Add a basic tile load error handler
        cesiumViewer.scene.globe.tileLoadProgressEvent.addEventListener(
          (tilesRemaining) => {
            if (
              tilesRemaining > 0 &&
              cesiumViewer.scene.globe._surface?.tileProvider?.errorEvent
            ) {
              cesiumViewer.scene.globe._surface.tileProvider.errorEvent.addEventListener(
                (tileProviderError) => {
                  tileProviderError.retry = false;
                  console.error("Tile provider error:", tileProviderError);
                }
              );
            }
          }
        );

        if (!destroyed) {
          viewerRef.current = cesiumViewer;
          setViewerReady(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Cesium failed to initialize:", error);
        setIsLoading(false);
      }
    };

    initializeViewer();

    return () => {
      destroyed = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isMapVisible]);

  return (
    <CesiumViewerContext.Provider
      value={{
        viewer: viewerRef.current,
        viewerReady,
        isMapVisible,
        setMapVisible,
        isLoading,
      }}
    >
      {children}
    </CesiumViewerContext.Provider>
  );
};
