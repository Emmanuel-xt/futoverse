"use client";
import { useOnlineShops } from "@components/providers/OnlineShopsProvider";
import { fetchAllShops, filterShops } from "@lib/actions/shops.prisma";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoIosLogOut } from "react-icons/io";

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [debounceTimer, setDebounceTimer] = useState(null); // State to hold the debounce timer

  // Function to fetch all shops or search based on the term
  const fetchShops = async (term = "") => {
    if (term) {
      // If there is a search term, fetch filtered shops
      const filteredShops = await filterShops(term); // Fetch shops based on the search term
      setShops(filteredShops);
    } else {
      // If no search term, fetch all shops
      const allShops = await fetchAllShops();
      setShops(allShops);
    }
  };

  // Fetch all shops on component load
  useEffect(() => {
    fetchShops(); // Initially fetch all shops
  }, []);

  // Handle input change with 2-second debouncing
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Clear the previous timeout if the user is still typing
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new timeout to fetch shops after 2 seconds
    const newTimer = setTimeout(() => {
      fetchShops(term); // Fetch shops after 2 seconds
    }, 2000);

    // Save the new timer
    setDebounceTimer(newTimer);
  };

  return (
    <div className="mb-10">
      <div className="flex items-end gap-5 bg-primary backdrop-blur-lg px-10 py-5 pt-10 rounded-b-2xl">
        <div className="w-full">
          <p className="text-white font-bold mb-2">
            Explore All Stores in the Market Place
          </p>
          <div className="flex items-center bg-slate-200 rounded-2xl w-full p-1 px-3 mb-4">
            <input
              type="text"
              placeholder="Search Users"
              className="outline-none w-full bg-transparent"
              value={searchTerm}
              onChange={handleInputChange}
            />
            <FiSearch className="font-bold text-xl" />
          </div>
        </div>
      </div>
      <div className="flex flex-col p.-14 py-2  rounded-b-lg mx-1 h-[65v] overflow-y-scrol">
        {shops?.map((shop) => (
          <div
            className="flex flex-col py-2 bg-slate-200 mb-4 p-4 rounded-lg"
            key={shop.name}
          >
            <div className="flex items-center w-full">
              <div className="flex gap-3 items-center  -black  w-full">
                <div className="w-16 h-16 relative rounded  border-black">
                  <Image
                    src={
                      shop?.image ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    alt="brand image"
                    // layout="fill"
                    width={100}
                    height={100}
                    objectFit="contain"
                  />
                </div>
                <div className="w-[80%]">
                  <p className="font-bold text-ellipsis">{shop.name}</p>
                  <p>{shop.description}</p>
                  <p className="text-slate-700 text-sm text-ellipsis">
                    Category:{" "}
                    <span className="text-black">{shop.category}</span>
                  </p>
                </div>
              </div>

              <Link
                href={`/shops/${shop.name}`}
                className="bg-primary w-fit text-white rounded-full p-1 mt-3"
              >
                <IoIosLogOut className="text-3xl" />
              </Link>
            </div>

            {/* Check if shopItems were matched */}
            {shop.shopItems?.length > 0 && (
              <div className="mt-2">
                <p className="font-bold">Matched Items:</p>
                <ul className="list-disc list-inside">
                  {shop.shopItems
                    .filter(
                      (item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) // Filter items by matching the search term
                    )
                    .map((matchedItem) => (
                      <li key={matchedItem.id}>{matchedItem.name}</li> // Render only the matched items
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shops;
