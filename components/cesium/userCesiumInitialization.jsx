"use client";

import { useEffect } from "react";
import { Cartesian3, Rectangle } from "cesium";
import {
  addPlacesToViewer,
  callTHeCreateTIles,
  load3DModelForShop,
  loadAllTilesets,
  loadNewBuildingTileset,
  flytoDestination,
} from "@constants/functions";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";

export const useCesiumInitialization = ({
  viewer,
  viewerReady,
  setShops,
  setLabelEntities,
}) => {
  useEffect(() => {
    const initialize = async () => {
      if (!viewerReady || !viewer) return;

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(6.9961, 5.383, 600),
        orientation: { heading: 0, pitch: -Math.PI / 3, roll: 0 },
      });

      const futoBounds = Rectangle.fromDegrees(6.9633, 5.35, 7.024, 5.4108);
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1500;
      viewer.scene.screenSpaceCameraController.rectangleLimit = futoBounds;

      flytoDestination(viewer);

      loadNewBuildingTileset(viewer);
      loadAllTilesets(viewer);
      callTHeCreateTIles(viewer);

      const result = await fetchOnlyShops();
      if (result.success && Array.isArray(result.shops)) {
        result.shops.forEach((shop) => {
          const { name, longitude, latitude, size, id, category } = shop;
          load3DModelForShop(viewer, name, longitude, latitude, id, category);
        });
        setShops(result.shops);
      }

      // const labelEntities = await addPlacesToViewer(viewer);
      // setLabelEntities(labelEntities);
    };

    initialize();
  }, [viewerReady, setShops, setLabelEntities]);
};
