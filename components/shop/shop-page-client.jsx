"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MdEdit } from "react-icons/md";
import { FaCamera } from "react-icons/fa";

import { fetchUserShopById } from "@lib/actions/shops.prisma";
import { useCesiumViewer } from "@components/providers/CesiumViewerProvider";
import { useOnlineShops } from "@components/providers/OnlineShopsProvider";
import StatusDrawer from "@components/drawers/StatusDrawer";
import AddTextStatusDrawer from "@components/drawers/AddTextStatusDrawer";
import AddMediaStatusDrawer from "@components/drawers/AddMediaStatusDrawer";
import socket from "@components/socket/Socket";
import { flytoDestination, generateProfileLink } from "@constants/functions";
import ShopHeader from "./shop-header";
import ShopTabs from "./shop-tabs";
import ProductsTab from "./products-tab";
import RequestsTab from "./requests-tab";
import ShopInfoTab from "./shop-info-tab";
import ShopPageSkeleton from "./shop-page-skeleton";
import ShopError from "./shop-error";

export default function ShopPageClient({ shopId }) {
  const router = useRouter();
  const { data: session } = useSession();
  // const { viewer, setMapVisible } = useCesiumViewer();
  const onlineShops = useOnlineShops();
  const queryClient = useQueryClient();

  // UI State
  const [activeTab, setActiveTab] = useState("product");
  const [showDrawer, setShowDrawer] = useState(false);
  const [openTextStatusModal, setOpenTextStatusModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const menuRef = useRef(null);

  // Fetch shop data with TanStack Query
  const {
    data: shop,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      // console.log("🔄 Fetching shop data for:", shopId);
      const result = await fetchUserShopById(shopId);
      // console.log("✅ Shop data fetched:", result);
      return result;
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount}:`, error);
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!shopId,
  });

  // Derived state
  const userId = Number(session?.user?.id);
  const isShopMyOwn = shop?.userId === userId;
  const isShopActive = onlineShops.some(
    (onlineShop) => onlineShop.name === shopId
  );

  // Handle orders and socket connection
  useEffect(() => {
    if (!shop?.orders) return;

    const pendingOrders = shop.orders.filter(
      (order) => order.status === "Pending"
    );
    setOrders(pendingOrders);

    const handleNewOrder = (orderData) => {
      console.log("📦 New order received:", orderData);
      setOrders((prevOrders) => [...prevOrders, orderData]);

      // Invalidate and refetch shop data
      queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
    };

    socket.on("new_order", handleNewOrder);
    return () => socket.off("new_order", handleNewOrder);
  }, [shop?.orders, shopId, queryClient]);

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

  // Navigation handlers
  const handleBack = () => router.back();

  const pushToRelativeMap = () => {
    if (!shop) return;
    router.push("/map");
    // setMapVisible(true);
    // flytoDestination(viewer, shop.longitude, shop.latitude);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Loading state
  if (isLoading) {
    return <ShopPageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <ShopError error={error} onRetry={() => refetch()} onBack={handleBack} />
    );
  }

  // Not found state
  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-lg text-red-500">Shop not found.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-14">
      <ShopHeader
        shop={shop}
        isShopActive={isShopActive}
        onBack={handleBack}
        onStatusClick={() => setShowDrawer(true)}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
        menuRef={menuRef}
        isShopMyOwn={isShopMyOwn}
        onMapView={pushToRelativeMap}
        onShareProfile={generateProfileLink}
      />

      {shop && (
        <StatusDrawer
          open={showDrawer}
          openChange={setShowDrawer}
          shopName={shop.name}
          image={shop.image}
          status={shop?.statuses}
        />
      )}

      <div className="flex flex-col items-center justify-center mt-5 px-3">
        <h2 className="text-lg font-bold">{shopId}</h2>
        <p className="text-sm text-slate-500 text-center">
          {shop?.description}
        </p>
      </div>

      <ShopTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isShopMyOwn={isShopMyOwn}
        ordersCount={shop.orders?.length || 0}
      />

      {activeTab === "product" && (
        <ProductsTab shopItems={shop.shopItems || []} />
      )}

      {isShopMyOwn && activeTab === "requests" && (
        <RequestsTab orders={orders} />
      )}

      {!isShopMyOwn && activeTab === "info" && <ShopInfoTab shop={shop} />}

      {isShopMyOwn && (
        <>
          <MdEdit
            className="text-primary text-3xl fixed bottom-24 right-1 cursor-pointer"
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
            className="fixed bottom-16 right-1 cursor-pointer"
          >
            <FaCamera className="text-primary text-3xl" />
          </label>
          <AddMediaStatusDrawer shopId={shopId} />
        </>
      )}
    </div>
  );
}
