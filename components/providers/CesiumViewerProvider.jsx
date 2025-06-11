"use client";

// CesiumViewerContext.js
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  Viewer,
  Terrain,
  Ion,
  createWorldTerrainAsync,
  IonWorldImageryStyle,
  ImageryLayer,
  TileMapServiceImageryProvider,
  buildModuleUrl,
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
  Rectangle,
  IonImageryProvider,
} from "cesium";

const CesiumViewerContext = createContext(null);

export const useCesiumViewer = () => useContext(CesiumViewerContext);

export const CesiumViewerProvider = ({ children }) => {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false); // Add map visibility state

  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeViewer = async () => {
      try {
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
          requestRenderMode: true, //manual .requestRender() is mostly used when this is set to true , incase you start having entity update issues in the future
          maximumRenderTimeChange: Infinity,
          // terrainProvider: new EllipsoidTerrainProvider(),
        });

        cesiumViewer.imageryLayers.removeAll();

        // const imageryProvider = new UrlTemplateImageryProvider({
        //   url: "http://localhost:8000/{z}/{x}/{y}.png",
        //   tilingScheme: new WebMercatorTilingScheme(),
        //   minimumLevel: 15,
        //   maximumLevel: 18,
        //   credit: "Offline Tiles",
        //   rectangle: Rectangle.fromDegrees(6.9813, 5.3568, 7.0167, 5.412),
        // });

        // cesiumViewer.imageryLayers.addImageryProvider(imageryProvider);

        // Add your custom Cesium Ion imagery by assetId
        // cesiumViewer.imageryLayers.addImageryProvider(
        //   await IonImageryProvider.fromAssetId(4) // or replace 4 with your specific assetId
        // );

        cesiumViewer.scene.debugShowFramesPerSecond = true;
        // cesiumViewer.scene.globe.maximumScreenSpaceError = 2; increase to reduce quality , for future optimization sake

        cesiumViewer.scene.globe.tileLoadProgressEvent.addEventListener(
          (tilesRemaining) => {
            if (
              tilesRemaining > 0 &&
              cesiumViewer.scene.globe._surface?.tileProvider?.errorEvent
            ) {
              cesiumViewer.scene.globe._surface.tileProvider.errorEvent.addEventListener(
                (tileProviderError) => {
                  tileProviderError.retry = false;
                  setError("Failed to load Map");
                  console.error("Tile provider error:", tileProviderError);
                }
              );
            }
          }
        );
        viewerRef.current = cesiumViewer;
        setViewerReady(true);
      } catch (error) {
        // console.log("Error initialzing vesium", error);
        setError("Failed to load Map");
      }
    };

    initializeViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-red-600 font-bold text-xl">
          An Error Occured while trying to load the Map on Your Device , Please
          Refresh the Page
        </h2>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

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
