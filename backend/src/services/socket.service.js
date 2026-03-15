import { Server } from "socket.io";
import {
  subscribeToSymbol,
  unsubscribeFromSymbol,
} from "../services/binanceFeed.service.js";

let ioInstance = null;

export const socketService = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // 🟢 Join user room (existing)
    socket.on("joinUserRoom", (userId) => {
      if (!userId) return;
      socket.join(userId);
      console.log(`👤 User ${userId} joined personal room`);
    });

    // 🚀 Subscribe to symbol — FIXED
    socket.on("subscribeToSymbol", (symbol) => {
      if (!symbol) return;

      console.log(`📈 Client ${socket.id} subscribing to ${symbol}`);

      // Join chart room for this symbol
      socket.join(symbol);
      console.log(`🚀 Client ${socket.id} joined room: ${symbol}`);

      // Subscribe Binance socket if not already
      subscribeToSymbol(symbol);
    });

    // 🚀 Unsubscribe from symbol — FIXED
    socket.on("unsubscribeFromSymbol", (symbol) => {
      if (!symbol) return;

      console.log(`📉 Client ${socket.id} unsubscribing from ${symbol}`);

      // Leave chart room
      socket.leave(symbol);

      // If no more clients in room → unsubscribe Binance
      const room = io.sockets.adapter.rooms.get(symbol);
      if (!room || room.size === 0) {
        unsubscribeFromSymbol(symbol);
      }
    });

    // 🔚 Cleanup
    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io not initialized!");
  return ioInstance;
};
