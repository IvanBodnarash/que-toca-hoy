import { io } from "socket.io-client";

const BASE = "http://localhost:3000";

let getAccessToken = () => localStorage.getItem("token");

export const socket = io(BASE, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  auth: () => ({ token: getAccessToken() }),
});

export function reconnectSocket() {
  try {
    if (socket.connected) socket.disconnect();
    socket.auth = { token: getAccessToken() };
    socket.connect();
  } catch (error) {
    console.warn("reconnectSocket failed:", error);
  }
}

export function setAccessTokenGetter(fn) {
  getAccessToken = fn;
}
