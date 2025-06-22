"use client";

import { OccupiedTileDrawer } from "@components/drawers/map-drawers/OccupiedTileDrawer";
import { UnoccupiedTileDrawer } from "@components/drawers/map-drawers/UnoccupiedTileDrawer";
import { UserInfoDrawer } from "@components/drawers/map-drawers/UserInfoDrawer";

// interface MapDrawersProps {
//   showModal: boolean
//   setShowModal: (show: boolean) => void
//   showUserModal: boolean
//   setShowUserModal: (show: boolean) => void
//   isOccupied: boolean
//   tileInfo: any
//   userInfo: any
//   occupiedTileDetails: any
// }

export const MapDrawers = ({
  showShopModal,
  setShowShopModal,
  showOccuppiedTileModal,
  setOccuppiedTileModal, //
  showUnoccuppiedTileModal,
  setUnoccuppiedTileModal, //
  showUserModal,
  setShowUserModal,
  tileInfo,
  userInfo,
  occupiedTileDetails,
}) => {
  return (
    <>
      {/* User Info Drawer */}
      <UserInfoDrawer
        open={showUserModal}
        onOpenChange={setShowUserModal}
        userInfo={userInfo}
      />

      {/* Tile Drawers */}
      {/* {showModal && ( */}

      {/* {isOccupied ? ( */}

      {showOccuppiedTileModal && (
        <OccupiedTileDrawer
          open={showOccuppiedTileModal}
          onOpenChange={setOccuppiedTileModal}
          tileInfo={tileInfo}
          tileDetails={occupiedTileDetails}
        />
      )}
      {showShopModal && (
        <OccupiedTileDrawer
          open={showShopModal}
          onOpenChange={setShowShopModal}
          tileInfo={tileInfo}
          tileDetails={occupiedTileDetails}
        />
      )}

      {showUnoccuppiedTileModal && (
        <UnoccupiedTileDrawer
          open={showUnoccuppiedTileModal}
          onOpenChange={setUnoccuppiedTileModal}
          tileInfo={tileInfo}
        />
      )}
    </>
  );
};
