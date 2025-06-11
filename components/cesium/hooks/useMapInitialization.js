import { useCallback } from "react";
import { Cartesian3, Rectangle } from "cesium";

import {
  addPlacesToViewer,
  callTHeCreateTIles,
  flytoDestination,
  load3DModelForShop,
  loadAllTilesets,
  loadNewBuildingTileset,
} from "@constants/functions";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";
import { setupEventHandlers } from "../utils/eventHandler";

export const useMapInitialization = ({
  viewer,
  viewerReady,
  setShops,
  setLabelEntities,
  setError,
  selectedTile,
  setSelectedTile,
  setShowModal,
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
  const initializeCesium = useCallback(async () => {
    try {
      if (viewerReady && viewer) {
        // Set initial camera position
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

        // Set bounds and camera constraints
        const futoBounds = Rectangle.fromDegrees(
          6.963329954924063, // west (min lon)
          5.350024989233731, // south (min lat)
          7.024059572143244, // east (max lon)
          5.410862571178967 // north (max lat)
        );

        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1500;
        viewer.scene.screenSpaceCameraController.rectangleLimit = futoBounds;

        // Handle URL parameters for location
        const flyToLocationFromURL = () => {
          const urlParams = new URLSearchParams(window.location.search);
          const lat = urlParams.get("lat");
          const lng = urlParams.get("lng");

          if (lat && lng) {
            const longitude = parseFloat(lng);
            const latitude = parseFloat(lat);
            flytoDestination(viewer, longitude, latitude);
          }
        };

        flyToLocationFromURL();

        // Load map components
        loadNewBuildingTileset(viewer);
        loadAllTilesets(viewer);
        callTHeCreateTIles(viewer);

        // Load shops
        const loadAllRealShops = async () => {
          const load = await fetchOnlyShops();

          if (!load.success || !Array.isArray(load.shops)) {
            // setError("Failed to fetch shops");
            return;
          }

          load.shops.forEach((shop) => {
            const { name, longitude, latitude, size, id, category } = shop;
            const longCenter = longitude + size / 2;
            const latCenter = latitude + size / 2;
            load3DModelForShop(
              viewer,
              name,
              longCenter,
              latCenter,
              id,
              category
            );
          });
          setShops(load.shops);
        };

        // Load places and shops
        // const placesLabel = await addPlacesToViewer(viewer);
        // setLabelEntities(placesLabel);

        await loadAllRealShops();

        // Setup event handlers
        setupEventHandlers(viewer, {
          selectedTile,
          setSelectedTile,
          setShowModal,
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
      }
    } catch (error) {
      console.log("Error initiating the Viewer", error);
      setError("Failed to load Cesium viewer");
    }
  }, [viewer, viewerReady, selectedTile, occupiedTileDetails]);

  return { initializeCesium };
};
