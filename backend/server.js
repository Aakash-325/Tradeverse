import http from "http";
import app from "./src/app.js";
import { config } from "./src/config/config.js";
import db from "./src/config/db.js";
import { socketService } from "./src/services/socket.service.js";
import { startMarketDataFeed } from "./src/services/binanceFeed.service.js";

const server = http.createServer(app);

const StartServer = async () => {
  try {
    await db();

    const io = socketService(server);

    startMarketDataFeed(io);

    const PORT = config.app.port || 8000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    const shutdown = () => {
      console.log("\n⛔ Shutting down server...");
      server.close(() => {
        console.log("🔌 HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown); 
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

StartServer();
