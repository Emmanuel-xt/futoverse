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

const CesiumMapB = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();

  // State management
  const [selectedTile, setSelectedTile] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
  const [shops, setShops] = useState([]);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const [labelEntities, setLabelEntities] = useState([]);
  const [error, setError] = useState(null);

  // Custom hooks for logic separation
  const { initializeCesium } = useMapInitialization({
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
  });

  useSocketComponents();

  useEffect(() => {
    initializeCesium();
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
