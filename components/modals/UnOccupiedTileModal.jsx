import React, { useEffect, useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useCesiumViewer } from "../providers/CesiumViewerProvider";
import { load3DModel } from "@constants/functions";
import Modal from "@components/modals/Modal";
import {
  createShop,
  fetchUserShopById,
  fetchUserShopByUserId,
  shopCouter,
  updateShopTileId,
} from "@lib/actions/shops.prisma";
import { useSession } from "next-auth/react";
import { Cartesian3, Transforms } from "cesium";
import { shopCategories } from "@constants/arrays";
import socket from "@lib/socket";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import Link from "next/link";
// import { load3DModel } from "@constants/functions";

const TileModal = ({ showModal, setShowModal, tileInfo }) => {
  const { data: session } = useSession();

  const { viewer, viewerReady } = useCesiumViewer();

  const [showPitchModal, setShowPitchModal] = useState(false); // State for the second modal
  const [showNoUserModal, setShowNoUserModal] = useState(false); // State for the second modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for the final confirmation modal
  const [relocationModal, setRelocationModal] = useState(false); // State for the final confirmation modal
  const [relocationConfirmationModal, setRelocationConfirmationModal] =
    useState(false); // State for the final confirmation modal
  const [relocationError, setRelocationError] = useState(""); // State for the final confirmation modal

  const [userStores, setUserStores] = useState([]); // State for the final confirmation modal
  const [idOfShopToBeRelocated, setIdOfShopToBeRelocated] = useState(null);
  const [nameOfShopToBeRelocated, setNameOfShopToBeRelocated] = useState(null);

  const handleBookMark = () => {
    // console.log("Bookmarked Tile:", tileInfo.id);
    setShowModal(false); // Close the modal after bookmarking
  };

  const [numberOfShops, setNumberOfShops] = useState(0); // State for storing shop count  useEffect(() => {
  useEffect(() => {
    const getShopCount = async () => {
      if (session) {
        try {
          const shopCount = await shopCouter(parseFloat(session.user.id));
          setNumberOfShops(shopCount); // Update the state with the shop count
        } catch (error) {
          // console.error("Failed to fetch shop count:", error);
        }
      }
    };
    getShopCount();
  }, [session]);

  const handlePitch = () => {
    // console.log("handle pitch was striked");
    if (session) {
      setShowPitchModal(true); // Open the pitch modal
      // console.log("Pitched modal supposed don dey show");
    } else {
      setShowModal(false); // Close the modal after bookmarking
      setShowNoUserModal(true);
    }
  };

  const relocateLogic = async (storeId, storeName) => {
    setRelocationModal(false);
    // console.log("about to relocate store with the Id", storeId);
    setIdOfShopToBeRelocated(storeId);
    setNameOfShopToBeRelocated(storeName);
    setRelocationConfirmationModal(true);
  };

  const handleRelocate = async () => {
    setRelocationModal(true);
    // setShowModal(false);
    const shops = await fetchUserShopByUserId(parseFloat(session.user.id));
    setUserStores(shops);
  };
  const handleRelocationConfirm = async () => {
    const entityToRelocate = viewer.entities.getById(
      `tile-${idOfShopToBeRelocated}`
    );
    if (!entityToRelocate) {
      // console.log("we no see any store like that oo");
    }
    const wasPositionChanged = (entityToRelocate.position =
      Cartesian3.fromDegrees(tileInfo.longitude, tileInfo.latitude));
    socket.emit("tile_relocate", {
      id: `tile-${idOfShopToBeRelocated}`,
      longitude: tileInfo.longitude,
      latitude: tileInfo.latitude,
    });
    // const isRemoved = viewer.entities.remove(entityToRelocate); // Remove from current position
    // load3DModel(viewer, "new relocated", tileInfo.longitude, tileInfo.latitude);
    // console.log("shop suppose don dey show for new location");
    // console.log("wasPositionChanged", wasPositionChanged);
    const success = await updateShopTileId({
      storeName: nameOfShopToBeRelocated,
      newTileId: tileInfo.id,
      longitude: tileInfo.longitude,
      latitude: tileInfo.latitude,
      storeId: idOfShopToBeRelocated,
    });
    if (success) {
      setRelocationConfirmationModal(false);
      setShowModal(false);
    } else {
      setRelocationError("something went wrong , please try again");
    }
  };

  const handleNext = async () => {
    // setShowPitchModal(false); // Close the pitch modal
    setShowConfirmationModal(true); // Open the confirmation modal
    // setShowPitchModal(false); // Open the pitch modal
  };

  const [form, setForm] = useState({
    name: "",
    desc: "",
    category: "",
  });

  const handleChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleConfirm = async () => {
    const trimmedName = form.name.trim();
    const trimmedDesc = form.desc.trim();

    if (!trimmedName || !trimmedDesc || !form.category) {
      alert("Please fill in all the fields before submitting.");
      return;
    }

    setShowPitchModal(false);
    setShowConfirmationModal(false);

    if (session) {
      const created = await createShop({
        id: parseFloat(tileInfo.id),
        name: trimmedName,
        description: trimmedDesc,
        longitude: tileInfo.longitude,
        latitude: tileInfo.latitude,
        kingdom: "shopForm.kingdom", // Assuming this is placeholder
        category: form.category,
        userId: parseFloat(session.user.id),
      });

      if (created) {
        load3DModel(
          viewer,
          trimmedName,
          tileInfo.longitude,
          tileInfo.latitude,
          tileInfo.id
        );
        socket.emit("shop_creation", {
          name: trimmedName,
          longitude: tileInfo.longitude,
          latitude: tileInfo.latitude,
          id: tileInfo.id,
        });

        setShowModal(false);
      }
    }
  };

  return (
    <>
      {/* Main Tile Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="400px"
        height="fit"
      >
        <div className="flex flex-col gap-3 mb-2 bg-slate-300 text-black">
          <p className="text-center">Tile Information {tileInfo.id}</p>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex gap-3 w-full">
            {numberOfShops >= 1 && (
              <button
                className="bg-primary text-black p-1 rounded-lg px-4 w-1/2"
                onClick={handleRelocate}
              >
                Relocate
              </button>
            )}
            {/*  */}
            <button
              className="bg-primary text-black p-1 rounded-lg px-4 w-1/2"
              onClick={handlePitch}
            >
              Pitch
            </button>
            <button
              className="bg-primary text-black p-1 rounded-lg px-4 w-1/2"
              onClick={handleBookMark}
            >
              BookMark
            </button>
          </div>
          <div className="flex gap-3">
            <p className="text-[10px]">
              <strong>X:</strong> {tileInfo.longitude}
            </p>
            <p className="text-[10px]">
              <strong>Y:</strong> {tileInfo.latitude}
            </p>
          </div>
        </div>
      </Modal>

      {/* Second Modal for Pitching */}
      <Modal
        open={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        width="400px"
        height="fit"
      >
        <h6 className="text-xl font-semibold">
          Pitch Your Business on the Map
        </h6>
        <h6 className="text-slate-500 text-sm">
          Please fill in the details about your business
        </h6>
        <div className="flex flex-col gap-4 justify-center">
          <div className="flex flex-col gap-3 py-4">
            <div className="">
              <label htmlFor="name" className="text-sm text-black">
                Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="Enter your store name"
                className="bg-slate-200 w-full border-b outline-none text-sm p-2"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="">
              <label htmlFor="description" className="text-sm text-black">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Brief Description of what you do"
                value={form.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                className="bg-slate-200 w-full border p-[1px] rounded outline-none text-sm"
              />
            </div>
            <div className="">
              <label htmlFor="category" className="text-sm text-black">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(value) => handleChange("category", value)}
                className="w-full z-50"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="w-full z-50">
                  {shopCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button
            className="bg-primary text-white p-1 rounded-lg px-4"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </Modal>

      {/* Final Confirmation Modal */}

      <Modal
        open={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        width="300px"
        height="fit"
        className="border"
      >
        <div className=""></div>
        <h6 className="text-lg font-semibold text-center">Confirm Pitching</h6>
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-slate-700 text-center">
            Are you sure you want to pitch your business on Tile No:{" "}
            {tileInfo.id} with the provided details?
          </p>
          <div className="flex gap-2 text-sm">
            <button
              className="bg-transperent border border-primary text-black p-1 rounded-lg px-4"
              onClick={() => {
                setShowPitchModal(true);
                setShowConfirmationModal(false);
              }}
            >
              Edit
            </button>
            <button
              className="bg-primary text-white p-1 rounded-lg px-4"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showNoUserModal}
        onClose={() => setShowNoUserModal(false)}
        width="300px"
        height="fit"
        className="border"
      >
        <div className=""></div>
        <h6 className="text-lg font-semibold text-center">Opps</h6>
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-slate-700 text-center">
            You have to be a registered user to complete this action
          </p>
          <div className="flex gap-2 text-sm">
            <Link
              href={"/login"}
              className="bg-transperent border border-primary text-black p-1 rounded-lg px-4"
              onClick={() => {
                setShowPitchModal(true);
                setShowConfirmationModal(false);
              }}
            >
              Login
            </Link>
            <Link
              href={"/sign-up"}
              className="bg-transperent border border-primary text-black p-1 rounded-lg px-4"
              onClick={handleConfirm}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </Modal>

      <Modal
        open={relocationModal}
        onClose={() => setRelocationModal(false)}
        width="400px"
        height="fit"
        className="border"
      >
        <div className=""></div>
        <h6 className="text-lg font-semibold">Relocate Your Store</h6>
        <div className="flex flex-col gap-4w-full justify-center">
          <p className="text-sm text-slate-400">
            Select the Store You want to relocate
          </p>

          {userStores.map((store) => (
            <div
              className="flex mb-1 justify-between items-center hover:bg-dark-4 cursor-pointer rounded-md w-full"
              key={store.id}
            >
              <div className="">
                <p className="">{store.name}</p>
              </div>
              <button
                className="btn p-1"
                onClick={() => relocateLogic(store.id, store.name)}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={relocationConfirmationModal}
        onClose={() => setRelocationConfirmationModal(false)}
        width="400px"
        height="fit"
        className="border"
      >
        <div className=""></div>
        <h6 className="text-lg font-semibold">Confirm Relocation</h6>
        <div className="flex flex-col gap-4 items-center justify-center">
          <p className="text-sm text-slate-400">
            Are you sure you want to relocate your store
            {idOfShopToBeRelocated} to the new Tile{tileInfo.id} ?
          </p>
          +{" "}
          <div className="flex gap-2 text-sm">
            <button
              className="bg-primary text-white p-1 rounded-lg px-4"
              onClick={handleRelocationConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TileModal;
