import { useCallback, useEffect } from "react";
import { Cartesian3, Rectangle } from "cesium";

import {
  callTHeCreateTIles,
  flytoDestination,
  load3DModelForShop,
  loadAllTilesets,
  loadNewBuildingTileset,
} from "@constants/functions";

import { setupEventHandlers } from "../utils/eventHandler";

export const useMapInitialization = ({
  viewer,
  viewerReady,
  shops,

  setLabelEntities,
  setError,
  selectedTile,
  setSelectedTile,
  setShowModal,

  setShowShopModal,
  setOccuppiedTileModal,
  setUnoccuppiedTileModal,

  setShowUserModal,
  setShowLabelModal,
  setShowPointer,
  setTileInfo,
  setUserInfo,
  setLabelInfo,
  setPointerInfo,
  setIsOccupied,
  setOccupiedTileDetails,
  occupiedTileDetails,
}) => {
  // 🔹 One-time Cesium viewer setup
  const initializeCesium = useCallback(() => {
    if (!viewerReady || !viewer) return;

    try {
      // Camera start position
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          6.996121931660761,
          5.383035004589935,
          600
        ),
        orientation: {
          heading: 0,
          pitch: -Math.PI / 3,
          roll: 0,
        },
      });

      // Restrict camera to bounds
      const futoBounds = Rectangle.fromDegrees(
        6.963329954924063, // west
        5.350024989233731, // south
        7.024059572143244, // east
        5.410862571178967 // north
      );

      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1500;
      viewer.scene.screenSpaceCameraController.rectangleLimit = futoBounds;

      // Handle optional fly-to from URL
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get("lat");
      const lng = urlParams.get("lng");

      if (lat && lng) {
        flytoDestination(viewer, parseFloat(lng), parseFloat(lat));
      }

      // Load tilesets and tiles
      loadNewBuildingTileset(viewer);
      loadAllTilesets(viewer);
      callTHeCreateTIles(viewer);
    } catch (error) {
      console.error("Error initializing Cesium:", error);
      setError("Failed to load Cesium viewer");
    }
  }, [viewer, viewerReady, setError]);

  // 🔹 Load shops when both viewer & shop data are ready
  useEffect(() => {
    if (!viewer) return;

    shops?.forEach((shop) => {
      const { name, longitude, latitude, size, id, category } = shop;
      const longCenter = longitude + size / 2;
      const latCenter = latitude + size / 2;

      load3DModelForShop(viewer, name, longCenter, latCenter, id, category);
    });

    // Setup event handlers now that shops are available
    setupEventHandlers(viewer, {
      shops,
      setShowModal,
      setShowShopModal,
      setOccuppiedTileModal,
      setUnoccuppiedTileModal,
      setShowUserModal,
      setShowLabelModal,
      setShowPointer,
      setTileInfo,
      setUserInfo,
      setLabelInfo,
      setPointerInfo,
      setIsOccupied,
      setOccupiedTileDetails,
      occupiedTileDetails,
    });
  }, [viewer, shops]);

  return { initializeCesium };
};
