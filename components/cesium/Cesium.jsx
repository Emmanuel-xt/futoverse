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
  Model,
  Transforms,
  Matrix4,
  HeadingPitchRoll,
  Rectangle,
} from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  addPlacesToViewer,
  callTHeCreateTIles,
  checkIfTileOccupied,
  flytoDestination,
  load3DModelForShop,
  loadNewBuildingTileset,
} from "@constants/functions";
import OccupiedTile from "@components/modals/OccupiedTileModal";
import TileModal from "../modals/UnOccupiedTileModal";
import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import { motion } from "framer-motion";
import { IoMdArrowBack } from "react-icons/io";
import { fetchOnlyShops } from "@lib/actions/shops.prisma";
import MapFlyers from "@components/Navigation/MapFlyers";
import MapNav from "@components/Navigation/MapNav";
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
import { useSocket } from "@components/providers/SocketProvider";
import FindEntityModal from "@components/modals/FindEntityModal";
import LabelModal from "@components/modals/LabelModal";
import TerrainPositioner from "./TerrainPositioner";
import PointerModal from "@components/modals/PointerModal";
// import { useSocket } from "@components/socket/Socket";

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
  const [activeTile, setActiveTile] = useState(null); // State to keep track of the active tile

  const [shops, setShops] = useState([]);

  const [myId, setmyId] = useState(null);
  const socket = useSocket();
  const [labelsVisible, setLabelsVisible] = useState(false);
  const [labelEntities, setLabelEntities] = useState([]);

  useEffect(() => {
    socket.on("client_id", (clientId) => {
      console.log("Connected Client ID:", clientId);
      setmyId(clientId);
    });
  }, []);

  useEffect(() => {
    const initializeCesium = async () => {
      // Ion.defaultAccessToken;
      // ("eyJhbGciOiJIUzI1NiIsInR5cCI6Ik=pXVCJ9.eyJqdGkiOiJiNGNkMDgyYy1jZWQ5LTRkZjktODc5NS01YmYwOWU2YjQ4ZmUiLCJpZCI6MjA1NDMyLCJpYXQiOjE3MTE3NzUxNTV9.2JgatZJRPURzsB8ZytMKxqfjvF53JCkLbbnj90x63_A");
      // terrainProvider = await createWorldTerrainAsync();
      if (viewerReady && viewer) {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            6.99495977717274,
            5.383510261110621,
            400
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

        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0; // Minimum zoom level (higher value = less zoom-in)
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1000;

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

        const longitude = 6.9955297993; // Replace with your exact coordinates
        const latitude = 5.3823293861;
        const altitude = 0.1; // Adjust altitude as needed

        // const loadTerrain = async () => {
        //   try {
        //     const terrainModel = await viewer.scene.primitives.add(
        //       Model.fromGltfAsync({
        //         url: "https://futo-terrain-a0rzcqp6z-emmanuel-xts-projects.vercel.app/fmap10.glb",
        //         modelMatrix: Transforms.eastNorthUpToFixedFrame(
        //           Cartesian3.fromDegrees(longitude, latitude, altitude)
        //         ),
        //         scale: 1.0,
        //       })
        //     );
        //     // viewer.scene.primitives.add(terrainModel);
        //     console.log("Model suppose don dey show", terrainModel);
        //   } catch (error) {
        //     console.error("Failed to load terrain model:", error);
        //   }
        // };
        // await loadTerrain();

        const loadTerrain = async () => {
          try {
            const modelUrl = "/models/futo14.glb"; // Ensure this path is correct

            // Define model properties
            const longitude = 6.9955297993;
            const latitude = 5.3823293861;
            const height = 0;
            const heading = 90; // Adjust to rotate the model
            const pitch = 0;
            const roll = 0;
            const scale = 1;

            // Convert position & rotation
            const position = Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            );
            const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);
            const rotation = Transforms.headingPitchRollQuaternion(
              position,
              hpr
            );

            // Check if model already exists, update it; otherwise, create a new one

            viewer.entities.add({
              position: position,
              orientation: rotation,
              model: {
                uri: modelUrl,
                scale: scale,
                minimumPixelSize: 128,
              },
            });

            console.log("Model loaded successfully");
          } catch (error) {
            console.error("Failed to load terrain model:", error);
          }
        };

        // Call the function
        // await loadTerrain();

        loadNewBuildingTileset(viewer);

        callTHeCreateTIles(viewer);

        const loadAllRealShops = async () => {
          const load = await fetchOnlyShops();
          // Load 3D models and labels for each shop

          // Check if the fetch was successful and if `shops` exists
          if (!load.success || !Array.isArray(load.shops)) {
            console.error("Failed to load shops:", load.message);
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

          setActiveTile(tile);

          setOccupiedTileDetails(
            tileOccupied.details // Add shop owner (user) if occupied
          );
          setShowModal(true); // Open modal when tile is clicked
        };

        const handleUserClick = () => {
          console.log("handleUserClick called");
          // setShowModal(true); // Open modal when tile is clicked
          setShowUserModal(true);
        };
        const handleLabelClick = () => {
          console.log("handleLabelClick called");
          // setShowModal(true); // Open modal when tile is clicked
          setShowLabelModal(true);
        };
        const handlePointerClick = () => {
          console.log("handlePointerClick called");
          // setShowModal(true); // Open modal when tile is clicked
          setShowPointer(true);
        };

        // Click handler for picking tiles
        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement) => {
          const pickedObject = viewer.scene.pick(movement.position);
          console.log("Picked Object full:", { pickedObject });
          if (defined(pickedObject) && defined(pickedObject.id)) {
            const properties = pickedObject.id.properties?.getValue(
              JulianDate.now()
            );

            // Log picked object properties
            // console.log("Picked Object:", { properties });
            // console.log("properties", properties.id);

            const tileCenterLon =
              properties.coordinates.lon + properties.coordinates.size / 2;
            const tileCenterLat =
              properties.coordinates.lat + properties.coordinates.size / 2;

            if (properties.type === "tile") {
              handleTileClick(pickedObject.id);
              console.log("selscted tile value", selectedTile);

              if (selectedTile) {
                selectedTile.rectangle.material = new ColorMaterialProperty(
                  Color.CHOCOLATE.withAlpha(0.2)
                );
                console.log("there is a selscted tile o", selectedTile);
              } else {
                console.log("nothing like selscted tile o");
                pickedObject.id.rectangle.material = new ColorMaterialProperty(
                  Color.GREEN.withAlpha(0.2)
                );
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
              console.log("its a user entity");
              setUserInfo({
                username: properties.username,
                position: pickedObject.id.position.getValue(JulianDate.now()),
              });
              setShowUserModal(true);
              console.log("show modal state =", showUserModal);
            }

            if (properties.type === "label") {
              handleLabelClick();
              console.log("its a label entity");
              setLabelInfo({
                placename: properties.name,
                location: properties.coordinates,
              });
              setShowLabelModal(true);
              console.log("show label state =", showUserModal);
            }

            if (properties.type === "pointer") {
              handlePointerClick();
              console.log("its a Pointer entity");
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
    };

    initializeCesium();
  }, [viewer]);
  AddUserMarkerToMap();
  DisplayAllUserMarkers();
  ModelRelocation();
  NewShopCreation();
  AddOnlineMarkers();

  return (
    <>
      {/* <motion.div
        className="cesium-map-container"
        initial={{ opacity: 0, y: 100, zIndex: 1 }} // Start hidden and beneath
        animate={
          isMapVisible
            ? { opacity: 1, y: 0, zIndex: 10 }
            : { opacity: 0, y: 100, zIndex: 1 }
        } // Bring map on top and animate in
        transition={{ duration: 1, ease: "easeInOut" }} // Adjust timing as needed
        style={{ pointerEvents: isMapVisible ? "auto" : "none" }} // Disable pointer events when hidden
      > */}
      <div
        id="cesiumContainer"
        className="w-full h-[105vh] overflow-hidden relative border px-1"
      >
        {/* {viewer && (
            <TerrainPositioner viewer={viewer} modelUrl="/models/futo14.glb" />
          )} */}
        {/* search/other basr */}
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
    </>
  );
};

export default CesiumMapB;
