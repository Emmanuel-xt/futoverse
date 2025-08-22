"use client";

import Image from "next/image";
import Link from "next/link";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";

export default function ShopHeader({
  shop,
  isShopActive,
  onBack,
  onStatusClick,
  menuOpen,
  onMenuToggle,
  menuRef,
  isShopMyOwn,
  onMapView,
  onShareProfile,
}) {
  return (
    <>
      <div
        className={`relative text-white flex flex-col gap-3 items-center justify-center text-center h-[25vh] p-6 rounded-b-3xl pb-20 ${
          shop?.coverImage ? "bg-cover bg-center" : "bg-blue-500"
        }`}
        style={{
          backgroundImage: shop?.coverImage
            ? `url(${shop.coverImage})`
            : undefined,
        }}
      >
        <div className="absolute top-4 left-4 text-2xl cursor-pointer">
          <AiOutlineArrowLeft onClick={onBack} />
        </div>

        <div
          className={`absolute bottom-[-20px] cursor-pointer ${
            shop?.statuses && shop.statuses.length > 0
              ? "border-4 border-green-400 rounded-full"
              : "border-white"
          }`}
        >
          <Image
            src={shop?.image || "/images/noProfile.png"}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full w-24 h-24 border-4 object-cover"
            onClick={() => shop?.statuses.length > 0 && onStatusClick()}
          />
          {isShopActive && (
            <div className="w-5 h-5 bg-green-500 border-2 border-black rounded-full absolute top-1 right-0"></div>
          )}
        </div>
      </div>

      <div className="flex fixed top-5 right-5">
        <HiDotsVertical
          className="rounded-full text-3xl text-white cursor-pointer"
          onClick={onMenuToggle}
        />

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-5 top-3 mt-2 w-52 bg-white shadow-md rounded-md z-50"
          >
            {isShopMyOwn ? (
              <>
                <Link
                  href={`/shops/${shop.name}/edit`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit Store details
                </Link>
                <Link
                  href={`/shops/${shop.name}/add`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Add Products
                </Link>
              </>
            ) : (
              <Link
                href={`/profile/${shop?.user.username}`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Message store owner
              </Link>
            )}

            <button
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={onShareProfile}
            >
              Share Store Profile
            </button>
            <button
              onClick={onMapView}
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
    </>
  );
}
