import { Server } from 'socket.io';
import { config } from '../config/config.js';
import { setSocketIO } from './binance.service.js';

export const socketService = (server) => {

  const io = new Server(server, {
    cors: {
      origin: config.app.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setSocketIO(io);

  io.on('connection', (socket) => {
    console.log('⚡ New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🚪 Client disconnected:', socket.id);
    });
  });
};
