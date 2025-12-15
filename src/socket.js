import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io("https://api.mediscript.in", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }

  if (userId) {
    socket.emit("addUser", userId);
    console.log("Socket initialized for user:", userId);
  } else {
    console.warn("Socket init: userId is null");
  }

  return socket;
};

export const getSocket = () => socket;
