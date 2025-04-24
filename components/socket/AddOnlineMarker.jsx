const {
  useCesiumViewer,
} = require("@components/providers/CesiumViewerProvider");
const { useOnlineShops } = require("@components/providers/OnlineShopsProvider");

export const AddOnlineMarker = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();
  const onlineShops = useOnlineShops();
  const onlineShopNames = onlineShops.map((shop) => shop.name);

  if (viewer && onlineShopNames) {
    viewer.entities.values.forEach((entity) => {
      if (entity.properties && entity.properties.shopId) {
        const shopName = entity.properties.shopId.getValue(); // Get shop name

        if (onlineShopNames.includes(shopName)) {
          if (!entity.billboard) {
            entity.billboard = {
              image: "/path/to/online_marker.png", // Online marker image
              scale: 10,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -50.0),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                5000
              ),
            };
            // console.log("Bill Board added");
          }
        } else {
          if (entity.billboard) {
            delete entity.billboard; // Remove the marker if the shop is offline
          }
        }
      }
    });
  }
};
