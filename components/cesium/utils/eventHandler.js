import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Color,
  ColorMaterialProperty,
  JulianDate,
} from "cesium";

import { checkIfTileOccupied } from "@constants/functions";

export const setupEventHandlers = (viewer, handlers) => {
  const {
    shops,
    setShowModal,

    setShowShopModal,
    setOccuppiedTileModal, //
    setUnoccuppiedTileModal, //

    setShowUserModal,
    setShowLabelModal,
    setShowPointer,
    setTileInfo,
    setUserInfo,
    setLabelInfo,
    setPointerInfo,
    setOccupiedTileDetails,
    occupiedTileDetails,
  } = handlers;

  const handleTileClick = async (tile) => {
    const tileOccupied = checkIfTileOccupied(tile.properties.tileId, shops);

    if (tileOccupied.occupied) {
      setOccupiedTileDetails(tileOccupied.details);
      setOccuppiedTileModal(true);
      console.log("occupied tile was clicked");
    } else {
      setUnoccuppiedTileModal(true);
      console.log("unoccupied tile was clicked");
    }
  };

  const handleShopClick = async () => {
    console.log("Shop was clicked");
    setShowShopModal(true);
  };

  const handleUserClick = () => {
    setShowUserModal(true);
    console.log("user was clicked");
  };

  const handleLabelClick = () => {
    setShowLabelModal(true);
  };

  const handlePointerClick = () => {
    setShowPointer(true);
  };

  // Click handler for picking tiles
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);

    if (defined(pickedObject) && defined(pickedObject.id)) {
      const properties = pickedObject.id.properties?.getValue(JulianDate.now());

      const tileCenterLon =
        properties?.coordinates.lon + properties?.coordinates.size / 2;
      const tileCenterLat =
        properties?.coordinates.lat + properties?.coordinates.size / 2;

      if (properties.type === "tile") {
        handleTileClick(pickedObject.id);
        setTileInfo({
          longitude: tileCenterLon,
          latitude: tileCenterLat,
          size: properties.size,
          id: properties.tileId,
          occupiedDetails: occupiedTileDetails,
        });
      }

      if (properties.type === "shop") {
        handleShopClick();
        setTileInfo({
          longitude: tileCenterLon,
          latitude: tileCenterLat,
          size: properties.size,
          id: properties.tileId,
          occupiedDetails: occupiedTileDetails,
        });
      }

      if (properties.type === "user") {
        handleUserClick();
        setUserInfo({
          username: properties.username,
          position: pickedObject.id.position.getValue(JulianDate.now()),
        });
        setShowUserModal(true);
      }

      if (properties.type === "label") {
        handleLabelClick();
        setLabelInfo({
          placename: properties.name,
          location: properties.coordinates,
        });
        setShowLabelModal(true);
      }

      if (properties.type === "pointer") {
        handlePointerClick();
        setPointerInfo({
          location: properties.coordinates,
        });
        setShowPointer(true);
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  return handler;
};
