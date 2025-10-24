"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";
import {
  Viewer,
  Ion,
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
    let destroyed = false;

    const initializeViewer = async () => {
      if (typeof window === "undefined") return;

      try {
        Ion.defaultAccessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNGNkMDgyYy1jZWQ5LTRkZjktODc5NS01YmYwOWU2YjQ4ZmUiLCJpZCI6MjA1NDMyLCJpYXQiOjE3MTE3NzUxNTV9.2JgatZJRPURzsB8ZytMKxqfjvF53JCkLbbnj90x63_A";

        // ⚙️ Create imagery provider — optimized for mobile (lightweight, detailed)
        const imageryProvider = new UrlTemplateImageryProvider({
          url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png",
          tilingScheme: new WebMercatorTilingScheme(),
          maximumLevel: 18, // limit high zoom to prevent large texture uploads
        });

        // 🧠 Context options to disable heavy GPU features
        const contextOptions = {
          webgl: {
            antialias: false, // disable MSAA
            alpha: false,
            preserveDrawingBuffer: false,
          },
        };

        // 🗺️ Initialize Cesium viewer
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
          contextOptions,
          imageryProvider,
          scene3DOnly: true,
          terrainProvider: undefined, // optional: add your terrain later
        });

        // 🌍 Mobile performance tuning
        const scene = cesiumViewer.scene;
        scene.highDynamicRange = false;
        scene.logarithmicDepthBuffer = false;
        scene.globe.maximumScreenSpaceError = 2;
        scene.globe.tileCacheSize = 50;
        scene.globe.depthTestAgainstTerrain = false;
        scene.requestRenderMode = true;

        // 🧩 Error handling for tiles
        imageryProvider.errorEvent.addEventListener((err) => {
          console.error("Imagery tile error:", err);
        });

        cesiumViewer.scene.globe.tileLoadProgressEvent.addEventListener(
          (tilesRemaining) => {
            if (tilesRemaining === 0 && !destroyed) {
              cesiumViewer.scene.requestRender();
            }
          }
        );

        if (!destroyed) {
          viewerRef.current = cesiumViewer;
          setViewerReady(true);
        }
      } catch (error) {
        console.error("Cesium failed to initialize:", error);
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
