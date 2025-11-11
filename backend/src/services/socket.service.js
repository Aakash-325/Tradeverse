import { Server } from "socket.io";
import { config } from "../config/config.js";

export const socketService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.app.clientUrl || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(" New client connected:", socket.id);

    socket.on("joinUserRoom", (userId) => {
      if (!userId) return;
      socket.join(userId);
      console.log(`👤 User ${userId} joined personal room`);
    });

    socket.on("disconnect", () => {
      console.log(" Client disconnected:", socket.id);
    });
  });

  return io;
};
