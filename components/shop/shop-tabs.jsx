"use client";

export default function ShopTabs({
  activeTab,
  onTabChange,
  isShopMyOwn,
  ordersCount,
}) {
  return (
    <div className="mt-2 px-4">
      <div className="flex w-full justify-around mb-2 border-b">
        <button
          className={`p-2 ${
            activeTab === "product"
              ? "border-b-2 w-[150px] border-blue-500"
              : ""
          }`}
          onClick={() => onTabChange("product")}
        >
          Products
        </button>
        {!isShopMyOwn ? (
          <button
            className={`p-2 ${
              activeTab === "info" ? "border-b-2 w-[150px] border-blue-500" : ""
            }`}
            onClick={() => onTabChange("info")}
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
            onClick={() => onTabChange("requests")}
          >
            Requests
            <span className="bg-primary text-white text-sm p-1 rounded-full">
              {ordersCount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
