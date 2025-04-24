import React from "react";
import Modal from "./Modal";
import { FaDirections, FaRegShareSquare } from "react-icons/fa";
import { FaBookmark, FaRegBookmark, FaShareFromSquare } from "react-icons/fa6";
import { useLocation } from "@components/providers/LocationProvider";
import {
  drawLineBetweenPoints,
  generateLocationLink,
  getMapboxDirections,
} from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { userLocation } from "@constants/userDat";

const LabelModal = ({ showModal, setShowModal, labelInfo }) => {
  const { stableLocation, currentLocation, error } = useLocation();

  const { lon, lat } = labelInfo.location;
  const { viewer, viewerReady } = useCesiumViewer();

  //   const userlat = stableLocation.latitude;
  //   const userlon = stableLocation.longitude;
  const endLocation = {
    longitude: lon,
    latitude: lat,
  };
  // console.log("Pointer Modal Suppose dey show", labelInfo);
  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      width="350px"
      height="fit"
    >
      <div className=""></div>
      <h6 className="font-semibold text-sm text-center">
        {labelInfo.placename}
      </h6>

      <div className="flex flex-wrap gap-5 justify-center mt-2 p-1">
        <p
          className="flex flex-col gap-1 items-center text-sm"
          onClick={() => {
            if (stableLocation) {
              drawLineBetweenPoints(viewer, () => stableLocation, endLocation);
            } else {
              // console.warn("User location not available.");
            }
          }}
        >
          <FaDirections className="text-primary text-3xl bg-white rounded-full p-1" />
          Directions
        </p>
        <p
          className="flex flex-col gap-1 items-center text-sm"
          onClick={() => generateLocationLink(lon, lat)}
        >
          <FaShareFromSquare className="text-primary text-3xl bg-white rounded-full p-1" />
          Share
        </p>
        <p className="flex flex-col gap-1 items-center text-sm">
          <FaBookmark className="text-primary text-3xl bg-white rounded-full p-1" />
          Save
        </p>
      </div>
    </Modal>
  );
};

export default LabelModal;
