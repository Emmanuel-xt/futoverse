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
  showModal,
  setShowModal,
  showUserModal,
  setShowUserModal,
  isOccupied,
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
      {showModal && (
        <>
          {isOccupied ? (
            <OccupiedTileDrawer
              open={showModal}
              onOpenChange={setShowModal}
              tileInfo={tileInfo}
              tileDetails={occupiedTileDetails}
            />
          ) : (
            <UnoccupiedTileDrawer
              open={showModal}
              onOpenChange={setShowModal}
              tileInfo={tileInfo}
            />
          )}
        </>
      )}
    </>
  );
};
