// "use client";

// import { useEffect } from "react";
// import {
//   ScreenSpaceEventHandler,
//   ScreenSpaceEventType,
//   defined,
//   Color,
//   ColorMaterialProperty,
//   JulianDate,
// } from "cesium";
// import { checkIfTileOccupied } from "@constants/functions";
// import { fetchOnlyShops } from "@lib/actions/shops.prisma";

// export const useEntityClickHandler = ({
//   viewer,
//   selectedTile,
//   setSelectedTile,
//   setTileInfo,
//   setShowModal,
//   setIsOccupied,
//   setOccupiedTileDetails,
//   setUserInfo,
//   setShowUserModal,
//   setLabelInfo,
//   setShowLabelModal,
//   setPointerInfo,
//   setShowPointer,
// }) => {
//   useEffect(() => {
//     if (!viewer) return;

//     const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     handler.setInputAction(async (movement) => {
//       const picked = viewer.scene.pick(movement.position);
//       if (defined(picked) && defined(picked.id)) {
//         const props = picked.id.properties?.getValue(JulianDate.now());
//         const centerLon = props?.coordinates.lon + props?.coordinates.size / 2;
//         const centerLat = props?.coordinates.lat + props?.coordinates.size / 2;

//         if (props.type === "tile" || props.type === "shop") {
//           const shopsData = await fetchOnlyShops();
//           const result = checkIfTileOccupied(props.tileId, shopsData.shops);

//           setIsOccupied(result.occupied);
//           setOccupiedTileDetails(result.details);
//           setTileInfo({
//             longitude: centerLon,
//             latitude: centerLat,
//             size: props.size,
//             id: props.tileId,
//             occupiedDetails: result.details,
//           });

//           if (selectedTile) {
//             selectedTile.rectangle.material = new ColorMaterialProperty(
//               Color.CHOCOLATE.withAlpha(0.2)
//             );
//           } else {
//             picked.id.rectangle.material = new ColorMaterialProperty(
//               Color.GREEN.withAlpha(0.2)
//             );
//           }

//           setSelectedTile(picked.id);
//           setShowModal(true);
//         }

//         if (props.type === "user") {
//           setUserInfo({
//             username: props.username,
//             position: picked.id.position.getValue(JulianDate.now()),
//           });
//           setShowUserModal(true);
//         }

//         if (props.type === "label") {
//           setLabelInfo({
//             placename: props.name,
//             location: props.coordinates,
//           });
//           setShowLabelModal(true);
//         }

//         if (props.type === "pointer") {
//           setPointerInfo({
//             location: props.coordinates,
//           });
//           setShowPointer(true);
//         }
//       }
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     return () => {
//       handler.destroy();
//     };
//   }, [
//     viewer,
//     selectedTile,
//     setSelectedTile,
//     setTileInfo,
//     setShowModal,
//     setIsOccupied,
//     setOccupiedTileDetails,
//     setUserInfo,
//     setShowUserModal,
//     setLabelInfo,
//     setShowLabelModal,
//     setPointerInfo,
//     setShowPointer,
//   ]);
// };
