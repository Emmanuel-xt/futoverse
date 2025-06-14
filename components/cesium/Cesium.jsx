"use client";

import React, { useEffect, useState } from "react";
import "cesium/Build/Cesium/Widgets/widgets.css";

import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import { IoMdArrowBack } from "react-icons/io";

import MapFlyers from "@components/Navigation/MapFlyers";
import { useMapInitialization } from "./hooks/useMapInitialization";
// import { useMapEventHandlers } from "./hooks/useMapEventHandlers";
// import { useSocketComponents } from "./hooks/useSocketComponents";
import { MapDrawers, MapModals } from "./MapModals";
import { useSocketComponents } from "./hooks/useSocketComponent";
import { useShops } from "./hooks/useTileActions";

const CesiumMapB = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();

  // State management
  const [selectedTile, setSelectedTile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [occuppiedTileModal, setOccuppiedTileModal] = useState(false);
  const [unOccupiedTileModal, setUnoccuppiedTileModal] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);

  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [findEntityModal, setFindEntityModal] = useState(false);

  const [tileInfo, setTileInfo] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [labelInfo, setLabelInfo] = useState({});
  const [pointerInfo, setPointerInfo] = useState({});
  const [occupiedTileDetails, setOccupiedTileDetails] = useState({});
  const [isOccupied, setIsOccupied] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const [labelEntities, setLabelEntities] = useState([]);
  const [error, setError] = useState(null);

  const { data: shops, isLoading, error: shopFetchError } = useShops();

  // Custom hooks for logic separation
  const { initializeCesium } = useMapInitialization({
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
  });

  useSocketComponents();

  useEffect(() => {
    initializeCesium();

    return () => {
      // Cleanup Cesium Viewer if needed
      if (viewer && !viewer.isDestroyed()) {
        viewer.entities.removeAll();
        // viewer.dataSources.removeAll();
        // viewer.scene.screenSpaceCameraController.removeInputAction(
        //   Cesium.ScreenSpaceEventType.LEFT_CLICK
        // );
        // add any custom cleanup like event handlers you attached
      }
    };
  }, [viewer]);

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
        <div id="cesiumContainer" className="w-full h-[110vh] relative border">
          <MapFlyers
            labelsVisible={labelsVisible}
            setShowLabels={setLabelsVisible}
            labelEntities={labelEntities}
            findEntityModal={findEntityModal}
            setFindEntityModal={setFindEntityModal}
          />
        </div>

        <MapDrawers
          showModal={showModal}
          setShowModal={setShowModal}
          showShopModal={showShopModal}
          setShowShopModal={setShowShopModal}
          showOccuppiedTileModal={occuppiedTileModal}
          setOccuppiedTileModal={setOccuppiedTileModal}
          showUnoccuppiedTileModal={unOccupiedTileModal}
          setUnoccuppiedTileModal={setUnoccuppiedTileModal}
          showUserModal={showUserModal}
          setShowUserModal={setShowUserModal}
          isOccupied={isOccupied}
          tileInfo={tileInfo}
          userInfo={userInfo}
          occupiedTileDetails={occupiedTileDetails}
        />
      </div>
    </>
  );
};

export default CesiumMapB;
