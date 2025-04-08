"use client";

import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useLocation } from "@components/providers/LocationProvider";
import { fetchFilteredPlace } from "@lib/actions/places.prisma";
import {
  drawLineBetweenPoints,
  flytoDestination,
  getMapboxDirections,
} from "@constants/functions";
import { places } from "@constants/places";
import { userLocation } from "@constants/userDat";
import { Cartesian3, Color } from "cesium";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import {
  FaArrowLeft,
  FaArrowUp,
  FaBookmark,
  FaEye,
  FaEyeSlash,
  FaLocationArrow,
  FaLocationCrosshairs,
  FaPeopleArrows,
} from "react-icons/fa6";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const MapFlyers = ({
  labelsVisible,
  setShowLabels,
  labelEntities,
  findEntityModal,
  setFindEntityModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlace, setFilteredPlace] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [openFlyers, setOpenFlyers] = useState(false);
  const { viewer, viewerReady } = useCesiumViewer();
  const { stableLocation, error } = useLocation();
  const [locationError, setLocationError] = useState("");

  const { data: session } = useSession();

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredPlace([]);
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(async () => {
      const onlineResults = await fetchFilteredPlace(term);
      const localResults = places.filter((place) =>
        place.placeName.toLowerCase().includes(term.toLowerCase())
      );

      const combinedResults = [...onlineResults, ...localResults];
      setFilteredPlace(combinedResults);
    }, 2000);

    setDebounceTimer(newTimer);
  };

  const handleFly = async (long, lat) => {
    if (viewerReady) {
      flytoDestination(viewer, long, lat);
      if (error) {
        setLocationError(error);
        return;
      }
      const shopLocation = { longitude: long, latitude: lat };
      const userLocation = {
        longitude: stableLocation.longitude,
        latitude: stableLocation.latitude,
      };

      await drawLineBetweenPoints(viewer, userLocation, shopLocation);
    }
  };

  const handleFlyBack = () => {
    flytoDestination(viewer, stableLocation.longitude, stableLocation.latitude);
  };

  return (
    <div className="absolute right-0 top-0 w-full bg-slate-200 bg-dark-1 p-1 text-3xl text-light-1 z-20">
      <div className="flex gap-2 items-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center">
          <Image
            src={
              session?.user?.image ||
              `https://randomuser.me/api/portraits/men/1.jpg`
            }
            alt="profile_image"
            width={100}
            height={90}
            className="w-10 h-10 rounded-full border-2 border-primary-500"
          />
        </div>

        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search Location .."
            value={searchTerm}
            onChange={handleInputChange}
            className="text-black text-sm outline-none border rounded-lg p-1 w-full"
          />
          {filteredPlace.length > 0 && (
            <ul className="absolute text-sm bg-white text-black w-full max-h-40 overflow-y-scroll mt-1 p-1 cursor-pointer">
              {filteredPlace.map((place, index) => (
                <li
                  key={index}
                  className="hover:bg-slate-300"
                  onClick={() => handleFly(place.longitude, place.latitude)}
                >
                  {place.placeName}
                </li>
              ))}
            </ul>
          )}
          {locationError && <p>Cannot give you directions: {locationError}</p>}
        </div>

        <FaHome
          className="text-black cursor-pointer"
          onClick={() =>
            viewer.camera.flyTo({
              destination: Cartesian3.fromDegrees(6.987165, 5.394837, 500),
              orientation: { heading: 0, pitch: -Math.PI / 3, roll: 0 },
            })
          }
        />
      </div>

      {stableLocation && (
        <>
          <div className="fixed bg-slate-200 cursor-pointer z-20 bottom-20 right-8 text-lg  p-2 rounded-lg">
            <div
              className={`transition-all duration-300 ${
                openFlyers ? "block" : "hidden"
              }`}
            >
              <div
                className="text-blue-500 flex items-center gap-2"
                onClick={() => setFindEntityModal(true)}
              >
                Find a Mate <FaPeopleArrows />
              </div>
              <div
                className="text-blue-500 flex items-center gap-2 mt-2"
                onClick={handleFlyBack}
              >
                Fly Me Back <FaLocationArrow />
              </div>
              <div
                className="text-blue-500 flex items-center gap-2 mt-2"
                onClick={() => {
                  setShowLabels((prev) => !prev);
                  labelEntities.forEach((entity) => {
                    entity.label.show = !labelsVisible; // Toggle visibility
                  });
                }}
              >
                {labelsVisible ? "Hide Labels" : "Show Labels"}{" "}
                {labelsVisible ? <FaEyeSlash /> : <FaEye />}{" "}
              </div>
            </div>

            <button
              className="mt-2 text-blue-500 bg-gray-700 p-1 rounded-full"
              onClick={() => setOpenFlyers(!openFlyers)}
            >
              {openFlyers ? <FaArrowUp /> : <FaArrowLeft />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapFlyers;
