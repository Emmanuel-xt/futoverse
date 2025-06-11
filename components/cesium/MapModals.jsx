import React from "react";
import OccupiedTile from "@components/modals/OccupiedTileModal";
import TileModal from "@components/modals/UnOccupiedTileModal";
import UserInfoModal from "@components/modals/UserInfoModal";
import FindEntityModal from "@components/modals/FindEntityModal";
import LabelModal from "@components/modals/LabelModal";
import PointerModal from "@components/modals/PointerModal";

export const MapModals = ({
  showModal,
  setShowModal,
  showUserModal,
  setShowUserModal,
  showLabelModal,
  setShowLabelModal,
  showPointer,
  setShowPointer,
  findEntityModal,
  setFindEntityModal,
  isOccupied,
  tileInfo,
  userInfo,
  labelInfo,
  pointerInfo,
  occupiedTileDetails,
}) => {
  return (
    <>
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

      {showModal && (
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
      )}
    </>
  );
};
