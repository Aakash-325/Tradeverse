import http from 'http';
import app from './src/app.js';
import { config } from './src/config/config.js';
import { startBinanceSocket } from './src/services/binance.service.js';
import { socketService } from './src/services/socket.service.js';
import db from './src/config/db.js';

const server = http.createServer(app);


const StartServer = async () => {
  try {
    await db();

    socketService(server);

    startBinanceSocket();

    const PORT = config.app.port || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

StartServer();
