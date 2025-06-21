import { io } from "socket.io-client";

const isDevelopment = process.env.NODE_ENV === "development";
const socketServerURL = isDevelopment
  ? // ? "http://localhost:4000" // Local server during development
    "https://socket-server-2ynk.onrender.com" // Local server during development
  : "https://socket-server-2ynk.onrender.com"; // Hosted server during production

const socket = io(socketServerURL, {
  transports: ["websocket"], // Recommended transport for better performance
});

export default socket;
