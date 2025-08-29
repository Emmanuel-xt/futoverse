"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
import { Viewer, Ion, IonImageryProvider } from "cesium";

const CesiumViewerContext = createContext(null);

export const useCesiumViewer = () => useContext(CesiumViewerContext);

const GLOBAL_VIEWER_KEY = "__cesium_viewer_instance__";

export const CesiumViewerProvider = ({ children }) => {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    let destroyed = false;

    const initializeViewer = async () => {
      try {
        if (typeof window === "undefined") return;

        console.log("[v0] Initializing viewer...");

        const containerElement = document.getElementById("cesiumContainer");
        if (!containerElement) {
          console.log("[v0] Container not found, retrying...");
          setTimeout(initializeViewer, 100);
          return;
        }

        console.log("[v0] Container found:", containerElement);

        // Check if we have an existing viewer
        if (
          window[GLOBAL_VIEWER_KEY] &&
          !window[GLOBAL_VIEWER_KEY].isDestroyed()
        ) {
          const existingViewer = window[GLOBAL_VIEWER_KEY];
          console.log("[v0] Found existing viewer:", existingViewer);

          // Check if the existing viewer's container is still in the DOM
          const existingContainer = existingViewer.container;
          console.log("[v0] Existing container:", existingContainer);
          console.log(
            "[v0] Is existing container in DOM:",
            document.contains(existingContainer)
          );

          if (!document.contains(existingContainer)) {
            console.log(
              "[v0] Existing container not in DOM, destroying old viewer..."
            );
            existingViewer.destroy();
            delete window[GLOBAL_VIEWER_KEY];
          } else {
            // Container is still valid, reuse the viewer
            console.log("[v0] Reusing existing viewer");
            viewerRef.current = existingViewer;
            setViewerReady(true);
            return;
          }
        }

        console.log("[v0] Creating new viewer...");

        Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGNkMDgyYy1jZWQ5LTRkZjktODc5NS01YmYwOWU2YjQ4ZmUiLCJpZCI6MjA1NDMyLCJpYXQiOjE3MTE3NzUxNTV9.2JgatZJRPURzsB8ZytMKxqfjvF53JCkLbbnj90x63_A";

        const cesiumViewer = new Viewer("cesiumContainer", {
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
          maximumRenderTimeChange: Number.POSITIVE_INFINITY,
        });

        cesiumViewer.imageryLayers.removeAll();

        cesiumViewer.imageryLayers.addImageryProvider(
          await IonImageryProvider.fromAssetId(4)
        );

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
          console.log("[v0] Viewer created successfully");
          viewerRef.current = cesiumViewer;
          window[GLOBAL_VIEWER_KEY] = cesiumViewer;
          setViewerReady(true);
        }
      } catch (error) {
        console.error("Cesium failed to initialize:", error);
        // Don't set any state that affects render
      }
    };

    initializeViewer();

    return () => {
      destroyed = true;
      // Only clean up the ref
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        window[GLOBAL_VIEWER_KEY] &&
        !window[GLOBAL_VIEWER_KEY].isDestroyed()
      ) {
        window[GLOBAL_VIEWER_KEY].destroy();
        delete window[GLOBAL_VIEWER_KEY];
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <CesiumViewerContext.Provider
      value={{
        viewer: viewerRef.current,
        viewerReady,
        isMapVisible,
        setMapVisible,
      }}
    >
      {children}
    </CesiumViewerContext.Provider>
  );
};
