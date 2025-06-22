"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";

const OnlineShopsContext = createContext([]);

export const OnlineShopsProvider = ({ children }) => {
  const [onlineShops, setOnlineShops] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    const handleOnlineShopsUpdate = (shops) => {
      // console.log("SHops at online shop provider", shops);
      // Flatten and transform the array of shop objects
      const flattenedShops = Array.isArray(shops)
        ? shops.flatMap((shopData) => shopData.shops || [])
        : Object.values(shops).flatMap((shopData) => shopData.shops || []);

      setOnlineShops(flattenedShops);
      // console.log("online shops =", shops);
    };

    socket.on("update_online_shops", handleOnlineShopsUpdate);

    return () => {
      socket.off("update_online_shops", handleOnlineShopsUpdate);
    };
  }, [socket]);

  return (
    <OnlineShopsContext.Provider value={onlineShops}>
      {children}
    </OnlineShopsContext.Provider>
  );
};

export const useOnlineShops = () => useContext(OnlineShopsContext);
