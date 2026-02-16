import { io } from "socket.io-client";

const socketServerURL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://socket-server-2ynk.onrender.com";

const socket = io(socketServerURL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export default socket;
