import React, { useEffect } from "react";
import { load3DModel } from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import {
  BillboardGraphics,
  Cartesian3,
  DistanceDisplayCondition,
  HeightReference,
  HorizontalOrigin,
  VerticalOrigin,
} from "cesium";
import { useSocket } from "@components/providers/SocketProvider";
import { useOnlineShops } from "@components/providers/OnlineShopsProvider";

export const ModelRelocation = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();
  const socket = useSocket();

  socket.on("update_tileDetaiils", (data) => {
    // const { viewer } = useCesiumViewer();

    const { id, longitude, latitude } = data;
    if (viewer && viewerReady) {
      const entityToRelocate = viewer.entities.getById(id);
      if (!entityToRelocate) {
        // console.log(
        //   "why you dey trigger socket to relocate tile wey no dey exist?"
        // );
      }
      entityToRelocate.position = Cartesian3.fromDegrees(longitude, latitude);
      viewer.scene.requestRender();
      // console.log(
      //   "shop wey another person relocated from some where don move to new locaton , you bad !!"
      // );
    } else {
      // console.log("i dont know why but somehow , viewer no dey ");
    }
  });
};

export const NewShopCreation = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();
  const socket = useSocket();

  useEffect(() => {
    socket.on("update_shopEntites", (data) => {
      // console.log("shop update fired from swerver", data);
      const { name, longitude, latitude, id } = data;
      if (viewer) {
        const entityToAdd = viewer.entities.getById(`tile-${id}`);
        if (entityToAdd) {
          // console.log("Dont worryy , entity is alreafy there");
          return null;
        }
        load3DModel(viewer, name, longitude, latitude, id);
        viewer.scene.requestRender();
        // console.log("shop updates was triggered and model loaded successfully");
      }
    });
  }, [socket, viewer]);
};

// const { useCesiumViewer } = require("@components/providers/CesiumViewerProvider");
// const { useOnlineShops } = require("@components/providers/OnlineShopsProvider");
// import { useEffect } from "react";
// import { Cartesian3, VerticalOrigin, HorizontalOrigin, HeightReference, DistanceDisplayCondition, BillboardGraphics } from "cesium";
// import { useCesiumViewer } from "./useCesiumViewer";
// import { useOnlineShops } from "./useOnlineShops";

export const AddOnlineMarkers = () => {
  const { viewer } = useCesiumViewer();
  const onlineShops = useOnlineShops();
  const onlineShopNames = onlineShops.map((shop) => shop.name);

  useEffect(() => {
    if (!viewer || !onlineShopNames) return;

    // Filter entities that are shop-related
    const shopEntities = viewer.entities.values.filter(
      (entity) => entity.properties && entity.properties.shopId
    );

    shopEntities.forEach((entity) => {
      const shopName = entity.properties.shopId.getValue(); // Get shop name

      if (onlineShopNames.includes(shopName)) {
        // Add or update the online marker
        if (!entity.billboard) {
          entity.billboard = new BillboardGraphics({
            image: "/assets/pricelogo.png", // Online marker image
            scale: 0.5,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.CENTER,
            eyeOffset: new Cartesian3(0.0, 0.0, -50.0),
            heightReference: HeightReference.CLAMP_TO_GROUND,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 5000),
          });
          viewer.scene.requestRender();
        }
      } else {
        // Remove the marker if the shop is offline
        if (entity.billboard) {
          entity.billboard = undefined; // Safely remove the billboard
          viewer.scene.requestRender();
        }
      }
    });
  }, [viewer, onlineShopNames]); // Add `onlineShopNames` as dependency
};
