"use client";
import Image from "next/image";
import { AiOutlineArrowLeft, AiOutlineBell } from "react-icons/ai";
import { useParams } from "next/navigation";
import { fetchUserShopById } from "@lib/actions/shops.prisma";
import { useEffect, useRef, useState } from "react";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa";
import {
  drawLineBetweenPoints,
  generateProfileLink,
} from "@constants/functions";
import { userLocation } from "@constants/userDat";

import { shopCategories } from "@constants/arrays";
// import StatusDrawer from "@components/drawers/StatusDrawer";
// import AddTextStatusDrawer from "@components/drawers/AddTextStatusDrawer";
// import AddMediaStatusDrawer from "@components/drawers/AddMediaStatusDrawer";
// import { useOnlineShops } from "@components/providers/OnlineShopsProvider";
// import { useToast } from "@components/hooks/use-toast";
import { useOnlineShops } from "@components/providers/OnlineShopsProvider";
import { CiLocationOn } from "react-icons/ci";
import StatusDrawer from "@components/drawers/StatusDrawer";
import AddTextStatusDrawer from "@components/drawers/AddTextStatusDrawer";
import { MdEdit } from "react-icons/md";
import AddMediaStatusDrawer from "@components/drawers/AddMediaStatusDrawer";
import Link from "next/link";
import socket from "@components/socket/Socket";
import { HiDotsVertical } from "react-icons/hi";
import { useSession } from "next-auth/react";

const ShopDynamicPage = ({ params }) => {
  const shopId = params.id.replace(/%20/g, " ");
  const [shop, setShop] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { viewer, viewerReady, setMapVisible } = useCesiumViewer();
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [openTextStatusModal, setOpenTextStatusModal] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true); // Initial loading state set to true
  const onlineShops = useOnlineShops();
  const { data: session } = useSession();
  const userId = session?.user.id;

  const isShopMyOwn = shop?.userId == userId;
  const isShopActive = onlineShops.some((shop) => shop.name === shopId);

  console.log("Is shop my own ", shop);

  const [activeTab, setActiveTab] = useState("product");
  const [orders, setOrders] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchUserShop = async () => {
      try {
        const fetchedShop = await fetchUserShopById(shopId);
        setShop(fetchedShop);
        console.log("fetched shop to check if shop is min ", fetchedShop);
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setLoadingShop(false); // Set loading to false after fetching is complete
      }
    };
    fetchUserShop();
  }, [shopId]);

  useEffect(() => {
    const pendingOrders = shop?.orders.filter(
      (order) => order.status === "Pending"
    ); // Filter only pending orders
    setOrders(pendingOrders);
    console.log("Orders", orders);
    socket.on("new_order", (orderData) => {
      toast("New Order was placed");

      setOrders((prevOrders) => [...prevOrders, orderData]);
    });
  }, [shop]);

  const pushToRelativeMap = () => {
    setMapVisible(true);
    const shopLocation = {
      longitude: shop.longitude,
      latitude: shop.latitude,
    };
    // drawLineBetweenPoints(viewer, userLocation, shopLocation);
    flytoDestination(viewer, shop.longitude, shop.latitude);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRejectClick = async (orderId) => {
    const rejected = await rejectOrder(orderId, "Items not available");
    console.log("rejected", rejected);
  };

  const calculateOrderTotal = (items) => {
    return items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems =
    searchTerm.trim() === ""
      ? shop?.shopItems || []
      : shop?.shopItems?.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

  if (loadingShop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Loading shop details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">Shop not found.</p>
      </div>
    );
  }
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg--100 pb-14">
      <div className="relative bg-blue-500 text-white flex flex-col gap-3  items-center justify-center text-center h-[30vh] p-6 rounded-b-3xl pb-20">
        <div className="absolute top-4 left-4 text-2xl cursor-pointer">
          <AiOutlineArrowLeft onClick={handleBack} />
        </div>

        <h2 className="text-lg font-bold">{shopId}</h2>
        <p className="text-sm text-slate-200">{shop?.description}</p>

        <div
          className={`absolute  bottom-[-20px] ${
            shop?.statuses && shop.statuses.length > 0
              ? "border-4 border-green-400 rounded-full"
              : "border-white"
          }`}
        >
          <Image
            src={shop?.image || "/assets/IceHomeImage1.jpg"}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-full w-24 h-24 border-4 "
            onClick={() => shop?.statuses.length > 0 && setShowDrawer(true)}
          />
          {isShopActive && (
            <div className="w-5 h-5 bg-green-500 border-2 border-black rounded-full absolute top-1 right-0"></div>
          )}
        </div>
      </div>
      <div className="flex fixed top-5 right-5 ">
        <HiDotsVertical
          className="rounded-full text-3xl text-white cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-5 top-3 mt-2 w-52 bg-white shadow-md rounded-md "
          >
            {isShopMyOwn ? (
              <>
                <Link
                  href="/profile/edit"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit Store details
                </Link>
                <Link
                  href={`${params.id}/add`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Add Products
                </Link>
              </>
            ) : (
              <Link
                href={`/chat?receiverId=${shop?.userId}`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Message store owner
              </Link>
            )}

            <button
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => generateProfileLink()}
            >
              Share Store Profile
            </button>
            <button
              onClick={() => pushToRelativeMap}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              View Store in Map
            </button>
            <button className="block px-4 py-2 text-red-600 hover:bg-gray-100 w-full text-left">
              Report Store (N/A)
            </button>
          </div>
        )}
      </div>
      {shop && (
        <StatusDrawer
          open={showDrawer}
          openChange={setShowDrawer}
          shopName={shop.name}
          image={shop.image}
          status={shop?.statuses}
        />
      )}

      <div className="mt-5 px-4">
        <div className="flex w-full justify-around mb-4 border-b">
          <button
            className={`p-2 ${
              activeTab === "product"
                ? "border-b-2 w-[150px] border-blue-500"
                : ""
            }`}
            onClick={() => handleTabChange("product")}
          >
            Products
          </button>
          {!isShopMyOwn ? (
            <button
              className={`p-2 ${
                activeTab === "info"
                  ? "border-b-2 w-[150px] border-blue-500"
                  : ""
              }`}
              onClick={() => handleTabChange("info")}
            >
              Shop Profile
            </button>
          ) : (
            <button
              className={`p-2 flex gap-2 items-center ${
                activeTab === "requests"
                  ? "border-b-2 w-[150px] border-blue-500"
                  : ""
              }`}
              onClick={() => handleTabChange("requests")}
            >
              Requests{" "}
              <p className="bg-primary text-white text-sm p-1 rounded-full">
                {shop.orders.length}
              </p>
            </button>
          )}
        </div>
      </div>
      {/* recent changes */}
      {activeTab === "product" && (
        <div className="p-4">
          <div className="">
            {filteredItems.length !== 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredItems.map((product, index) => (
                  <Link
                    href={`/product/${product.id}`}
                    key={index}
                    className="bg-slate-100 border p-2 rounded shadow-sm h-24 relative"
                  >
                    <Image
                      src={product.image}
                      alt="Product"
                      layout="fill" /* Makes the image take full width & height */
                      objectFit="contain" /* Ensures the image covers the entire space */
                      className="rounded"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-700 text-lg">
                No Product Found
              </div>
            )}
          </div>
        </div>
      )}

      {isShopMyOwn ? (
        <div className="bg-slate-50">
          {activeTab === "requests" &&
            (orders && orders.length > 0 ? (
              <div className="w-full">
                {orders.map((order) => (
                  <>
                    <p className="text-slate-600 font-semibold px-2 text-lg">
                      {" "}
                      {order.user.username}
                    </p>

                    <div
                      key={order.id}
                      className="p-2 border  mb-2 rounded-lg flex flex-col gap-1 items-center justify-between w-full"
                    >
                      {order.items.map((item, i) => (
                        <div className="flex w-full bg-white" key={i}>
                          <Image
                            src={item.image || "/assets/IceHomeImage1.jpg"}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="w-20 h-20 mr-4 rounded"
                          />
                          <div className="w-full flex flex-col gap-1">
                            <div className="flex justify-between">
                              <div className=" ">
                                <h3 className="font-semibold">
                                  {item.name.length > 50
                                    ? item.name.substring(0, 25) + "..."
                                    : item.name}
                                </h3>
                                {/* <p className="text-sm text-slate-700">
                        {item.description.length > 50
                          ? item.description.substring(0, 50) + "..."
                          : item.description}
                      </p> */}
                              </div>
                            </div>

                            <div className="flex  items-center justify-between">
                              <p className="font-bold">
                                ₦{item.price.toFixed(2)}
                              </p>
                              <p className="mx-2">x{item.quantity}</p>
                              <div className="">
                                <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">
                                  Accept
                                </button>
                                <button className=" text-black border border-black  px-2 py-1 rounded">
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ))}
              </div>
            ) : (
              <div className="h-20 text-slate-300 flex flex-col items-center justify-center">
                <p>You Don&apos;t have any Pending Order</p>
              </div>
            ))}
        </div>
      ) : (
        activeTab === "info" && <>Shop Info Here</>
      )}

      {isShopMyOwn && (
        <>
          <MdEdit
            className="text-primary text-3xl fixed bottom-24 right-1"
            onClick={() => setOpenTextStatusModal(true)}
          />
          {openTextStatusModal && (
            <AddTextStatusDrawer
              open={openTextStatusModal}
              openChange={setOpenTextStatusModal}
              shopId={shopId}
            />
          )}
          <label
            htmlFor="status-media"
            className=" fixed bottom-16 right-1 cursor-pointer"
          >
            <FaCamera
              className="text-primary text-3xl "
              // onClick={() => setOpenMediaStatusModal(true)}
            />
          </label>
          <AddMediaStatusDrawer shopId={shopId} />
        </>
      )}
    </div>
  );
};

export default ShopDynamicPage;
