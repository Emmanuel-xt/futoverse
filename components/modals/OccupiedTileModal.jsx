"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Link from "next/link";
// import Button from "../Button";
import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CopyIcon } from "lucide-react";
import { generateLocationLink } from "@constants/functions";
import { FaDeleteLeft } from "react-icons/fa6";
import { deleteStore } from "@lib/actions/shops.prisma";
import { useSession } from "next-auth/react";

const OccupiedTile = ({
  showModal,
  setShowModal,
  tileInfo,
  tileDetails,
  onRelocate,
}) => {
  const { viewer, viewerReady, setMapVisible } = useCesiumViewer();
  const [openDeleteModal, setopenDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState(""); // State for the final confirmation modal
  const { data: session } = useSession();

  const router = useRouter();

  // console.log("tileuser =", tileDetails.user.username);

  const handleViewProfile = () => {
    setMapVisible(false);
    router.push(`/profile/${tileDetails.name}`);
  };

  const handleEnterShop = () => {
    // setMapVisible(false);
    router.push(`/shops/${tileDetails.name}`);
  };
  const entityToRelocate = viewer.entities.getById(`tile-${tileInfo.id}`);
  const handleDeleteStore = async (storeName) => {
    setDeleteError("");
    try {
      const success = await deleteStore(storeName);
      if (success) {
        const isRemoved = viewer.entities.remove(entityToRelocate);
        // console.log("is removed ", isRemoved);
        setopenDeleteModal(false);
      }
    } catch (error) {
      setDeleteError("something went wrong");
      // console.log("Error Deleting store", error);
    }
  };
  return (
    <div>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="400px"
        height="fit"
      >
        <div className="flex flex-col gap-3">
          {tileInfo.id && <p className="text-center">Tile No: {tileInfo.id}</p>}

          <div className="flex justify-between">
            <Link
              href={`/profile/${tileDetails.user?.username}`}
              className="flex gap-2 items-center"
            >
              <div className="w-7 h-7 rounded-full ">
                <Image
                  src={
                    tileDetails.user.picture ||
                    `https://randomuser.me/api/portraits/men/1.jpg`
                  }
                  alt="profile_image"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
              <p className="text-slate-400">{tileDetails.user.username}</p>
            </Link>
            {session?.user.name === tileDetails.user.username && (
              <FaDeleteLeft
                className="text-2xl "
                onClick={() => setopenDeleteModal(true)}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Image
              src={tileDetails.image || `/images/noProfile.png`}
              alt={tileDetails.name}
              width={100}
              height={100}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm">Store Name : {tileDetails.name}</p>
              <p className="text-sm">Category: {tileDetails.category}</p>
              <p className="text-sm">Description: {tileDetails.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 ">
            {/* <div className=""> */}
            <Link
              className="bg-primary text-sm text-white p-1 rounded-lg px-4 "
              // onClick={handleEnterShop}
              href={`/shops/${tileDetails.name}`}
            >
              Enter Store
            </Link>
            {/* </div> */}
            <div className="flex gap-2 ">
              {/* <Button Label="View Profile" handleClick={handleViewProfile} /> */}
              <button
                className="bg-primary border border-primary text-white p-1 rounded-lg px-4 w-1/2"
                onClick={() => handleViewProfile}
              >
                View Profile
              </button>
              <button className="bg-primary text-sm text-white p-1 rounded-lg px-4 w-1/2">
                Bookmark
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-[10px]">
          <p className="text-sm">Location: Opposite Munalux Hotel</p>

          <div className="flex gap--3 items-center">
            {tileInfo.longitude && (
              <div className="flex gap-3">
                <p>
                  <strong>X:</strong> {tileInfo.longitude}
                </p>
                <p>
                  <strong>Y:</strong> {tileInfo.latitude}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                generateLocationLink(tileInfo.longitude, tileInfo.latitude)
              }
            >
              <CopyIcon className=" text-2xl" />
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={openDeleteModal}
        onClose={() => setopenDeleteModal(false)}
        width="400px"
        height="fit"
        className="border"
      >
        <div className=""></div>
        <h6 className="text-lg font-semibold">Confirm Delete</h6>
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-slate-400">
            Are you absolutely sure you want to delete this particular store ,
            (Action cannot be undone !)
          </p>
          {deleteError && <p className="">{deleteError}</p>}

          <div className="flex gap-2 text-sm">
            <button
              className="bg-red-500 text-white p-1 rounded-lg px-4"
              onClick={() => handleDeleteStore(tileDetails.name)}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OccupiedTile;
