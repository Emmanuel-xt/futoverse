import React from "react";
import Modal from "./Modal";
import { FaDirections, FaBookmark } from "react-icons/fa";
import { FaShareFromSquare } from "react-icons/fa6";
import { useLocation } from "@components/providers/LocationProvider";
import {
  drawLineBetweenPoints,
  generateLocationLink,
} from "@constants/functions";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { userLocation } from "@constants/userDat";

const PointerModal = ({ showModal, setShowModal, pointerInfo }) => {
  const { currentPosition, error } = useLocation();
  const { longitude, latitude } = pointerInfo.location;
  const { viewer } = useCesiumViewer();

  const endLocation = {
    longitude,
    latitude,
  };

  // console.log("New direction requested to:", endLocation);
  // console.log("Current user position:", currentPosition);

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      width="350px"
      height="fit"
    >
      <div className="flex flex-wrap gap-5 justify-center mt-2 p-1">
        <p
          className="flex flex-col gap-1 items-center text-sm"
          onClick={() => {
            if (userLocation) {
              drawLineBetweenPoints(viewer, () => userLocation, endLocation);
            } else {
              console.warn("User location not available.");
            }
          }}
        >
          <FaDirections className="text-primary text-3xl bg-white rounded-full p-1" />
          Directions
        </p>
        <p
          className="flex flex-col gap-1 items-center text-sm"
          onClick={() => generateLocationLink(longitude, latitude)}
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

export default PointerModal;
