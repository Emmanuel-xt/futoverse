"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";

const OnlineUsersContext = createContext([]);

export const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    const handleOnlineUsersUpdate = (users) => {
      setOnlineUsers(users);
      // console.log("online users at context =", users);
      // const flattenedShops = users.flatMap((usersData) => usersData.shops || []);
    };

    socket.on("update_online_user", handleOnlineUsersUpdate);

    return () => {
      socket.off("update_online_user", handleOnlineUsersUpdate);
    };
  }, [socket]);

  // Convert object to array before providing it
  const onlineUsersArray = Object.values(onlineUsers);

  return (
    <OnlineUsersContext.Provider value={onlineUsersArray}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext);
