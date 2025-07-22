import WebSocket from 'ws';
import Bottleneck from 'bottleneck';
import EventEmitter from 'events';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

let socket = null;
const reconnectDelay = 5000;
let retryAttempts = 0;
const maxRetries = 5;

const activeStreams = new Set();
const candles = new Map();
const trades = new Map();
const orderBooks = new Map();

const emitter = new EventEmitter(); // Event emitter

const limiter = new Bottleneck({
  minTime: 250, // 4 messages/sec to stay safe (Binance allows 5/sec)
});

// Utility
const buildStreams = (symbol, types) =>
  types.map(type => `${symbol.toLowerCase()}@${type}`);

export const getCandle = (symbol) => candles.get(symbol.toUpperCase()) || null;
export const getTrade = (symbol) => trades.get(symbol.toUpperCase()) || null;
export const getOrderBook = (symbol) => orderBooks.get(symbol.toUpperCase()) || null;
export const getActiveStreams = () => Array.from(activeStreams);

// Start WS
export const startBinanceSocket = () => {
  socket = new WebSocket(BINANCE_WS_URL);

  socket.on('open', () => {
    console.log('✅ Binance WebSocket connected');
    retryAttempts = 0;

    // Re-subscribe to previous streams
    if (activeStreams.size > 0) {
      limiter.schedule(() =>
        socket.send(JSON.stringify({
          method: 'SUBSCRIBE',
          params: Array.from(activeStreams),
          id: Date.now()
        }))
      );
    }
  });

  socket.on('message', (raw) => {
    const message = JSON.parse(raw);
    const stream = message.stream;
    const payload = message.data;

    if (!stream || !payload) return;
    const symbol = payload.s || (payload.k && payload.k.s);
    if (!symbol) return;

    if (stream.includes('@kline')) {
      const k = payload.k;
      const data = {
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
        volume: k.v,
        time: new Date(k.t).toLocaleTimeString()
      };
      candles.set(symbol.toUpperCase(), data);
      emitter.emit('kline', symbol.toUpperCase(), data);
    } else if (stream.includes('@trade')) {
      const data = {
        price: payload.p,
        quantity: payload.q,
        time: new Date(payload.T).toLocaleTimeString()
      };
      trades.set(symbol.toUpperCase(), data);
      emitter.emit('trade', symbol.toUpperCase(), data);
    } else if (stream.includes('@depth')) {
      const data = {
        bids: payload.b,
        asks: payload.a
      };
      orderBooks.set(symbol.toUpperCase(), data);
      emitter.emit('depth', symbol.toUpperCase(), data);
    }
  });

  socket.on('ping', () => {
    socket.pong(); // Respond to ping to keep alive
    console.log('📡 Ping received from Binance — pong sent');
  });

  socket.on('error', (err) => {
    console.error('❌ Binance WebSocket error:', err.message);
  });

  socket.on('close', () => {
    console.warn('⚠️ Binance WebSocket closed');
    if (retryAttempts < maxRetries) {
      retryAttempts++;
      console.log(`🔁 Reconnecting in ${reconnectDelay / 1000}s (attempt ${retryAttempts}/${maxRetries})`);
      setTimeout(startBinanceSocket, reconnectDelay);
    } else {
      console.error('❌ Max reconnect attempts reached. Manual restart required.');
    }
  });
};

// Subscribe
export const subscribeToStreams = async (symbol, types) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log('❌ Socket not ready');
    return;
  }

  const streams = buildStreams(symbol, types);
  const newStreams = streams.filter(s => !activeStreams.has(s));
  if (newStreams.length === 0) return;

  await limiter.schedule(() =>
    socket.send(JSON.stringify({
      method: "SUBSCRIBE",
      params: newStreams,
      id: Date.now()
    }))
  );

  newStreams.forEach(s => activeStreams.add(s));
  console.log(`📡 Subscribed to ${symbol.toUpperCase()} => [${types.join(', ')}]`);
};

// Unsubscribe
export const unsubscribeFromStreams = async (symbol, types) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log('❌ Socket not ready');
    return;
  }

  const streams = buildStreams(symbol, types);
  const toRemove = streams.filter(s => activeStreams.has(s));
  if (toRemove.length === 0) return;

  await limiter.schedule(() =>
    socket.send(JSON.stringify({
      method: "UNSUBSCRIBE",
      params: toRemove,
      id: Date.now()
    }))
  );

  toRemove.forEach(s => activeStreams.delete(s));
  console.log(`🔕 Unsubscribed from ${symbol.toUpperCase()} => [${types.join(', ')}]`);
};

// Listen for data updates
export const onStreamUpdate = (type, listener) => {
  emitter.on(type, listener);
};
