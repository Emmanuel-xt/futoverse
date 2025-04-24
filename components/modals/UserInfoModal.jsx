"use client";
import { fetchOnlyUserInfo } from "@lib/actions/user.prisma";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { FaRegEnvelope } from "react-icons/fa6";
import Link from "next/link";
import { drawLineBetweenPoints } from "@constants/functions";
import { userLocation } from "@constants/userDat";
import { FaDirections } from "react-icons/fa";
import { Cartographic, Math } from "cesium";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useLocation } from "@components/providers/LocationProvider";
// import { userLocation } from "@constants/userDat";

const UserInfoModal = ({ showModal, setShowModal, userInfo }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { viewer, viewerReady } = useCesiumViewer();
  const { stableLocation, error } = useLocation();
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        // console.log("userinfo", userInfo);
        const user = await fetchOnlyUserInfo(userInfo.username);
        if (!user) {
          setMessage("user does not exist");
        }
        setUser(user);
      } catch (error) {
        // console.log("Error fetching user", error);
      } finally {
        setLoading(false);
      }
    };
    // console.log("fetch info useEffect ran");
    fetchUserInfo();
    // console.log("user", user);
  }, []);

  const cartesian = userInfo.position;
  const cartographic = Cartographic.fromCartesian(cartesian);
  const longitude = Math.toDegrees(cartographic.longitude);
  const latitude = Math.toDegrees(cartographic.latitude);
  const endLocation = {
    longitude: longitude,
    latitude: latitude,
  };

  return (
    <Modal
      open={showModal}
      onClose={() => setShowModal(false)}
      width="300px"
      height="fit"
    >
      {loading ? (
        <>Loading..</>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center  px-3 text-center  w-full">
            <div className="rounded-full w-24 h-24 border ">
              <Image
                src={
                  user?.picture ||
                  `https://randomuser.me/api/portraits/men/1.jpg`
                }
                alt="profile_image"
                width={100}
                height={100}
                className="rounded-full w-24 h-24"
              />
            </div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-[12px]">@{user?.username}</p>
            <p className="">{user?.department?.name}</p>
            <p className="">{user?.level?.name} Level</p>
            <div className="flex flex-col gap-2">
              {user?.username && (
                <Link
                  href={`/profile/${user?.username}`}
                  className="bg-primary text-sm text-white p-1 rounded-lg px-4 "
                  // onClick={handleEnterShop}
                >
                  View Profile
                </Link>
              )}
              <div className="flex gap-2">
                {user?.id && (
                  <Link
                    href={`/chat?receiverId=${user?.id}`}
                    className="bg-primary-500 flex items-center flex-col text- p-1 rounded-lg px-4 "
                    // onClick={handleEnterShop}
                  >
                    <FaRegEnvelope className="text-2xl text-primary" />
                    Message
                  </Link>
                )}
                <p
                  className="flex flex-col gap-1 items-center text-sm"
                  onClick={() =>
                    drawLineBetweenPoints(viewer, userLocation, endLocation)
                  }
                >
                  <FaDirections className="text-primary text-3xl bg-white rounded-full p-1" />
                  Directions
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {!user && "User Not Found"}
    </Modal>
  );
};

export default UserInfoModal;
