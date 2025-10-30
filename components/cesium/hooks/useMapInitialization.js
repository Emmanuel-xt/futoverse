import { useCallback, useEffect } from "react";
import { Cartesian3, Math, Rectangle } from "cesium";

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

      // Restrict camera to bounds
      const futoBounds = Rectangle.fromDegrees(
        6.963329954924063, // west
        5.350024989233731, // south
        7.024059572143244, // east
        5.410862571178967 // north
      );

      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 3000;
      viewer.scene.screenSpaceCameraController.rectangleLimit = futoBounds;

      // Handle optional fly-to from URL
      // 🔹 Try restoring saved camera view
      const savedView = JSON.parse(
        localStorage.getItem("cameraView") || "null"
      );
      if (savedView) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromRadians(
            savedView.lon,
            savedView.lat,
            savedView.height
          ),
          orientation: {
            heading: savedView.heading,
            pitch: savedView.pitch,
            roll: savedView.roll,
          },
          duration: 1.5,
        });
      } else {
        // Default view if no saved camera
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            0.12211527832901911, // longitude
            0.09381252264655088, // latitude
            751.2011803076922 // height
          ),
          orientation: {
            heading: 6.226261913948254, // radians
            pitch: -0.8325870197715304,
            roll: 0.000017565609374159408,
          },
        });
      }

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

      // ✅ Add camera movement listener (auto-save position)
      const saveCameraPosition = () => {
        const camera = viewer.camera;
        const pos = camera.positionCartographic;

        localStorage.setItem(
          "cameraView",
          JSON.stringify({
            lon: pos.longitude,
            lat: pos.latitude,
            height: pos.height,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
          })
        );
      };
      viewer.camera.changed.addEventListener(saveCameraPosition);
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
