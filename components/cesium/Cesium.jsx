"use client";

import React, { useEffect, useState } from "react";
import {
  Cartesian3,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Color,
  ColorMaterialProperty,
  JulianDate,
  Rectangle,
} from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  addPlacesToViewer,
  callTHeCreateTIles,
  checkIfTileOccupied,
  flytoDestination,
  load3DModelForShop,
  loadAllTilesets,
  loadNewBuildingTileset,
} from "@constants/functions";
import OccupiedTile from "@components/modals/OccupiedTileModal";
import TileModal from "../modals/UnOccupiedTileModal";
import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import { IoMdArrowBack } from "react-icons/io";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";
import MapFlyers from "@components/Navigation/MapFlyers";
import UserInfoModal from "@components/modals/UserInfoModal";
import {
  AddUserMarkerToMap,
  DisplayAllUserMarkers,
} from "@components/socket/AddUserMarkerToMap";
import {
  AddOnlineMarkers,
  ModelRelocation,
  NewShopCreation,
} from "@components/socket/ModelAddition";
import FindEntityModal from "@components/modals/FindEntityModal";
import LabelModal from "@components/modals/LabelModal";
import PointerModal from "@components/modals/PointerModal";

const CesiumMapB = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();
  const [selectedTile, setSelectedTile] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [showUserModal, setShowUserModal] = useState(false); // Modal visibility state
  const [showLabelModal, setShowLabelModal] = useState(false); // Modal visibility state
  const [showPointer, setShowPointer] = useState(false); // Modal visibility state
  const [findEntityModal, setFindEntityModal] = useState(false);
  const [tileInfo, setTileInfo] = useState({}); // Store tile data (longitude, latitude, ID)
  const [userInfo, setUserInfo] = useState({}); // Store tile data (longitude, latitude, ID)
  const [labelInfo, setLabelInfo] = useState({}); // Store tile data (longitude, latitude, ID)
  const [pointerInfo, setPointerInfo] = useState({}); // Store tile data (longitude, latitude, ID)
  const [occupiedTileDetails, setOccupiedTileDetails] = useState({});

  const [isOccupied, setIsOccupied] = useState(false); // State to check tile status

  const [shops, setShops] = useState([]);

  const [labelsVisible, setLabelsVisible] = useState(false);
  const [labelEntities, setLabelEntities] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCesium = async () => {
      try {
        if (viewerReady && viewer) {
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

          const futoBounds = Rectangle.fromDegrees(
            6.963329954924063, // west (min lon)
            5.350024989233731, // south (min lat)
            7.024059572143244, // east (max lon)
            5.410862571178967 // north (max lat)
          );

          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5; // Minimum zoom level (higher value = less zoom-in)
          viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1500;

          viewer.scene.screenSpaceCameraController.rectangleLimit = futoBounds;

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
          loadNewBuildingTileset(viewer);
          loadAllTilesets(viewer);
          callTHeCreateTIles(viewer);

          const loadAllRealShops = async () => {
            const load = await fetchOnlyShops();
            // Load 3D models and labels for each shop

            // Check if the fetch was successful and if `shops` exists
            if (!load.success || !Array.isArray(load.shops)) {
              // console.error("Failed to load shops:", load.message);
              return; // Stop execution if fetching shops failed
            }

            load.shops.forEach((shop) => {
              const { name, longitude, latitude, size, id, category } = shop;
              const longCenter = longitude;
              +size / 2;
              const latCenter = latitude;
              +size / 2;
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

          const placesLabel = await addPlacesToViewer(viewer);
          setLabelEntities(placesLabel);
          await loadAllRealShops();

          const handleTileClick = async (tile) => {
            const load = await fetchOnlyShops();
            const tileOccupied = checkIfTileOccupied(
              tile.properties.tileId,
              load.shops
            );
            // console.log("Ocuppation", tileOccupied);

            setIsOccupied(tileOccupied.occupied);

            setOccupiedTileDetails(
              tileOccupied.details // Add shop owner (user) if occupied
            );
            setShowModal(true); // Open modal when tile is clicked
          };

          const handleUserClick = () => {
            // console.log("handleUserClick called");
            // setShowModal(true); // Open modal when tile is clicked
            setShowUserModal(true);
          };
          const handleLabelClick = () => {
            // console.log("handleLabelClick called");
            // setShowModal(true); // Open modal when tile is clicked
            setShowLabelModal(true);
          };
          const handlePointerClick = () => {
            // console.log("handlePointerClick called");
            // setShowModal(true); // Open modal when tile is clicked
            setShowPointer(true);
          };

          // Click handler for picking tiles
          const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
          handler.setInputAction((movement) => {
            const pickedObject = viewer.scene.pick(movement.position);
            // console.log("Picked Object full:", { pickedObject });
            if (defined(pickedObject) && defined(pickedObject.id)) {
              const properties = pickedObject.id.properties?.getValue(
                JulianDate.now()
              );

              // Log picked object properties
              // console.log("Picked Object:", { properties });
              // console.log("properties", properties.id);

              const tileCenterLon =
                properties?.coordinates.lon + properties?.coordinates.size / 2;
              const tileCenterLat =
                properties?.coordinates.lat + properties?.coordinates.size / 2;

              if (properties.type === "tile") {
                handleTileClick(pickedObject.id);
                // console.log("selscted tile value", selectedTile);

                if (selectedTile) {
                  selectedTile.rectangle.material = new ColorMaterialProperty(
                    Color.CHOCOLATE.withAlpha(0.2)
                  );
                  // console.log("there is a selscted tile o", selectedTile);
                } else {
                  // console.log("nothing like selscted tile o");
                  pickedObject.id.rectangle.material =
                    new ColorMaterialProperty(Color.GREEN.withAlpha(0.2));
                }

                setSelectedTile(pickedObject.id);

                // Set tile data and open modal
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
                // Set tile data and open modal
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
                // console.log("its a user entity");
                setUserInfo({
                  username: properties.username,
                  position: pickedObject.id.position.getValue(JulianDate.now()),
                });
                setShowUserModal(true);
                // console.log("show modal state =", showUserModal);
              }

              if (properties.type === "label") {
                handleLabelClick();
                // console.log("its a label entity");
                setLabelInfo({
                  placename: properties.name,
                  location: properties.coordinates,
                });
                setShowLabelModal(true);
                // console.log("show label state =", showUserModal);
              }

              if (properties.type === "pointer") {
                handlePointerClick();
                // console.log("its a Pointer entity");
                setPointerInfo({
                  // placename: properties.name,
                  location: properties.coordinates,
                });
                setShowPointer(true);
                // console.log("show label state =", showUserModal);
              }
            }
          }, ScreenSpaceEventType.LEFT_CLICK);
        }
      } catch (error) {
        console.log("Error inititing the Viewer", Error);
        setError("Failed to load Cesium viewer");
      }
    };

    initializeCesium();

    // return () => viewerRef.current?.destroy();
  }, [viewer]);
  AddUserMarkerToMap();
  DisplayAllUserMarkers();
  ModelRelocation();
  NewShopCreation();
  AddOnlineMarkers();

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-red-600 font-bold text-xl">Error:</h2>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        <div
          id="cesiumContainer"
          className="w-full h-[110vh] relative border px-1"
        >
          <MapFlyers
            labelsVisible={labelsVisible}
            setShowLabels={setLabelsVisible}
            labelEntities={labelEntities}
            findEntityModal={findEntityModal}
            setFindEntityModal={setFindEntityModal}
          />

          <div
            className="absolute z-20  top-5 left-5"
            onClick={() => setMapVisible(false)}
          >
            <IoMdArrowBack className="text-white bg-dark-1 text-3xl rounded-full p-2" />
            <p className="text-white text-[10px]"></p>
          </div>
        </div>

        {/* Modal to display selected tile info */}

        {showUserModal && (
          <UserInfoModal
            showModal={showUserModal}
            setShowModal={setShowUserModal}
            userInfo={userInfo}
          />
        )}

        {findEntityModal && (
          <FindEntityModal
            showModal={findEntityModal}
            setShowModal={setFindEntityModal}
          />
        )}

        {showLabelModal && (
          <LabelModal
            showModal={showLabelModal}
            setShowModal={setShowLabelModal}
            labelInfo={labelInfo}
          />
        )}
        {showPointer && (
          <PointerModal
            showModal={showPointer}
            setShowModal={setShowPointer}
            pointerInfo={pointerInfo}
          />
        )}

        {/* {showModal && ( */}
        <>
          {isOccupied ? (
            <OccupiedTile
              showModal={showModal}
              setShowModal={setShowModal}
              tileInfo={tileInfo}
              tileDetails={occupiedTileDetails}
            />
          ) : (
            <TileModal
              showModal={showModal}
              setShowModal={setShowModal}
              tileInfo={tileInfo}
            />
          )}
        </>
        {/* </motion.div> */}
      </div>
    </>
  );
};

export default CesiumMapB;
