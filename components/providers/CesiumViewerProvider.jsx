"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
import {
  Viewer,
  Ion,
  IonImageryProvider,
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
} from "cesium";

const CesiumViewerContext = createContext(null);

export const useCesiumViewer = () => useContext(CesiumViewerContext);

export const CesiumViewerProvider = ({ children }) => {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    // if (viewerRef.current) return;
    let destroyed = false;

    const initializeViewer = async () => {
      try {
        if (typeof window === "undefined") return;

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
          maximumRenderTimeChange: Infinity,
        });

        // const googleMapsProvider = new UrlTemplateImageryProvider({
        //   url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        //   tilingScheme: new WebMercatorTilingScheme(),
        //   maximumLevel: 20,
        // });

        cesiumViewer.imageryLayers.removeAll();
        // cesiumViewer.imageryLayers.addImageryProvider(googleMapsProvider);

        const imageryLayer = cesiumViewer.imageryLayers.addImageryProvider(
          await IonImageryProvider.fromAssetId(4)
        );

        imageryLayer.imageryProvider.errorEvent.addEventListener((err) => {
          console.error("ImageryProvider error:", err);
        });

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
        }
      } catch (error) {
        console.error("Cesium failed to initialize:", error);
        // Don't set any state that affects render
      }
    };

    initializeViewer();

    return () => {
      destroyed = true;
      viewerRef.current?.destroy();
    };
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
