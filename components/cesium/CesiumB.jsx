"use client";

import React, { useState } from "react";
import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import MapFlyers from "@components/Navigation/MapFlyers";
import { IoMdArrowBack } from "react-icons/io";
import OccupiedTile from "@components/modals/OccupiedTileModal";
import TileModal from "../modals/UnOccupiedTileModal";
import UserInfoModal from "@components/modals/UserInfoModal";
import LabelModal from "@components/modals/LabelModal";
import PointerModal from "@components/modals/PointerModal";
import FindEntityModal from "@components/modals/FindEntityModal";

import {
  AddUserMarkerToMap,
  DisplayAllUserMarkers,
} from "@components/socket/AddUserMarkerToMap";
import {
  AddOnlineMarkers,
  ModelRelocation,
  NewShopCreation,
} from "@components/socket/ModelAddition";

import { useCesiumInitialization } from "./useCesiumInitialization";
import { useEntityClickHandler } from "./useEntityClickHandler";

const CesiumMapB = () => {
  const { viewer, viewerReady, isMapVisible, setMapVisible } =
    useCesiumViewer();

  const [selectedTile, setSelectedTile] = useState(null);
  const [tileInfo, setTileInfo] = useState({});
  const [occupiedTileDetails, setOccupiedTileDetails] = useState({});
  const [isOccupied, setIsOccupied] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showPointer, setShowPointer] = useState(false);
  const [findEntityModal, setFindEntityModal] = useState(false);

  const [userInfo, setUserInfo] = useState({});
  const [labelInfo, setLabelInfo] = useState({});
  const [pointerInfo, setPointerInfo] = useState({});
  const [labelEntities, setLabelEntities] = useState([]);
  const [shops, setShops] = useState([]);
  const [error, setError] = useState(null);

  useCesiumInitialization({ viewer, viewerReady, setShops, setLabelEntities });

  useEntityClickHandler({
    viewer,
    selectedTile,
    setSelectedTile,
    setTileInfo,
    setShowModal,
    setIsOccupied,
    setOccupiedTileDetails,
    setUserInfo,
    setShowUserModal,
    setLabelInfo,
    setShowLabelModal,
    setPointerInfo,
    setShowPointer,
  });

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
    <div className="relative w-full h-screen overflow-hidden">
      <div
        id="cesiumContainer"
        className="w-full h-[110vh] relative border px-1"
      >
        <MapFlyers
          labelsVisible
          setShowLabels={() => {}}
          labelEntities={labelEntities}
          findEntityModal={findEntityModal}
          setFindEntityModal={setFindEntityModal}
        />

        <div
          className="absolute z-20 top-5 left-5"
          onClick={() => setMapVisible(false)}
        >
          <IoMdArrowBack className="text-white bg-dark-1 text-3xl rounded-full p-2" />
        </div>
      </div>

      {showModal &&
        (isOccupied ? (
          <OccupiedTile {...{ tileInfo, setShowModal }} />
        ) : (
          <TileModal {...{ tileInfo, setShowModal }} />
        ))}

      {showUserModal && <UserInfoModal {...{ userInfo, setShowUserModal }} />}
      {showLabelModal && <LabelModal {...{ labelInfo, setShowLabelModal }} />}
      {showPointer && <PointerModal {...{ pointerInfo, setShowPointer }} />}
    </div>
  );
};

export default CesiumMapB;
