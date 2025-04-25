"use client";
import socket from "@components/socket/Socket";
import { fetchUserShopByUserId } from "@lib/actions/shops.prisma";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useRef } from "react";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // console.log("SocketProvider mounted");
  const { data: session } = useSession();
  const username = session?.user?.username;
  const userId = session?.user?.id ? parseFloat(session.user.id) : null;

  const hasEmittedUserOnline = useRef(false);
  const hasEmittedShops = useRef(false);

  useEffect(() => {
    if (username && userId && !hasEmittedUserOnline.current) {
      // console.log("Emitting set_user_online with username:", username);
      socket.emit("set_user_online", { userId, username });
      hasEmittedUserOnline.current = true; // Prevent duplicate emissions
    }
  }, [username, userId]);

  useEffect(() => {
    if (!userId || !username || hasEmittedShops.current) return;

    let isMounted = true;

    const fetchShops = async () => {
      try {
        const shops = await fetchUserShopByUserId(userId);
        if (isMounted && shops?.length) {
          // console.log("Fetched shops to be sent to socket server", shops);
          socket.emit("set_online_shops", { username, shops });
          // console.log("set_online_shops has been emitted successfully");
          hasEmittedShops.current = true;
        }
      } catch (error) {
        // console.error("Error fetching shops:", error);
      }
    };

    fetchShops();

    return () => {
      isMounted = false; // Prevent state updates if unmounted
    };
  }, [userId, username]);

  useEffect(() => {
    const handleConnect = () => {
      // console.log("Socket connected:", socket.id);
      // Re-emit user status and shops when connection is re-established
      if (userId && username) {
        socket.emit("set_user_online", { userId, username });
        hasEmittedUserOnline.current = true;
        // console.log("Re-emitted set_user_online after reconnection");

        fetchUserShopByUserId(userId).then((shops) => {
          if (shops?.length) {
            socket.emit("set_online_shops", { username, shops });
            // console.log("Re-emitted set_online_shops after reconnection");
          }
        });
      }
    };

    const handleDisconnect = (reason) => {
      // console.log(`Socket disconnected: ${reason}`);
      hasEmittedUserOnline.current = false; // Allow re-emission on reconnect
      hasEmittedShops.current = false;
    };

    const handleReconnectAttempt = (attemptNumber) => {
      // console.log(`Attempting to reconnect... Attempt #${attemptNumber}`);
    };

    const handleReconnectError = (error) => {
      // console.error("Reconnection error:", error);
    };

    const handleReconnectFailed = () => {
      // console.warn("Reconnection failed. Will not attempt further retries.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("reconnect_error", handleReconnectError);
    socket.on("reconnect_failed", handleReconnectFailed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("reconnect_error", handleReconnectError);
      socket.off("reconnect_failed", handleReconnectFailed);
      // console.log("SocketProvider unmounted");
    };
  }, [userId, username]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
