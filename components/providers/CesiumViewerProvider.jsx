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
        });
        // terrainProvider = createWorldTerrainAsync();
        // cesiumViewer.imageryLayers.removeAll();

        // Add your custom Cesium Ion imagery by assetId
        // cesiumViewer.imageryLayers.addImageryProvider(
        //   await IonImageryProvider.fromAssetId(4) // or replace 4 with your specific assetId
        // );
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
