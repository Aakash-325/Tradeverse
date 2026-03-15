import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 20000,
});

// socket.onAny((event, data) => {
//   console.log("📩 Socket Event:", event, data);
// });

export default socket;
