import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Color,
  ColorMaterialProperty,
  JulianDate,
} from "cesium";

import { checkIfTileOccupied } from "@constants/functions";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";

export const setupEventHandlers = (viewer, handlers) => {
  const {
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
  } = handlers;

  const handleTileClick = async (tile) => {
    const load = await fetchOnlyShops();
    const tileOccupied = checkIfTileOccupied(
      tile.properties.tileId,
      load.shops
    );

    setIsOccupied(tileOccupied.occupied);
    setOccupiedTileDetails(tileOccupied.details);
    setShowModal(true);
  };

  const handleUserClick = () => {
    setShowUserModal(true);
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

        if (selectedTile) {
          selectedTile.rectangle.material = new ColorMaterialProperty(
            Color.CHOCOLATE.withAlpha(0.2)
          );
        } else {
          pickedObject.id.rectangle.material = new ColorMaterialProperty(
            Color.GREEN.withAlpha(0.2)
          );
        }

        setSelectedTile(pickedObject.id);

        setTileInfo({
          longitude: tileCenterLon,
          latitude: tileCenterLat,
          size: properties.size,
          id: properties.tileId,
          occupiedDetails: occupiedTileDetails,
        });
        setShowModal(true);
      }

      if (properties.type === "shop") {
        handleTileClick(pickedObject.id);
        setTileInfo({
          longitude: tileCenterLon,
          latitude: tileCenterLat,
          size: properties.size,
          id: properties.tileId,
          occupiedDetails: occupiedTileDetails,
        });
        setShowModal(true);
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
