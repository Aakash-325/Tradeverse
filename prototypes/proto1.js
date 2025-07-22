import WebSocket from "ws";
import { config } from "../config/config.js";

const activeStreams = new Set();
const BinanceUrl = config.Binance.url;

let socket;

const candles = new Map();
const trades = new Map();
const orderBooks = new Map();
const MarketData = new Map();

// 🔁 NEW: Callback listeners for trade updates
const tradeListeners = new Map();  // key = symbol, value = [callback1, callback2, ...]

export const getCandles = (symbol) => {
  const key = symbol?.toUpperCase();
  return key ? candles.get(key) || null : null;
};

export const getTrades = (symbol) => {
  const key = symbol?.toUpperCase();
  return key ? trades.get(key) || null : null;
};

export const getOrderBooks = (symbol) => {
  const key = symbol?.toUpperCase();
  return key ? orderBooks.get(key) || null : null;
};

export const getMarketData = () => Array.from(MarketData.values());
export const getActiveStreams = () => Array.from(activeStreams);

// ✅ NEW: One-time listener for a real-time trade update
export const onTradeUpdate = (symbol, callback) => {
  const key = symbol.toUpperCase();
  if (!tradeListeners.has(key)) {
    tradeListeners.set(key, []);
  }
  tradeListeners.get(key).push(callback);
};

export const startBinanceSocket = () => {
  socket = new WebSocket(BinanceUrl);

  socket.on('open', () => {
    console.log("✅ Connected to Binance WebSocket.");
    if (!activeStreams.has('!miniTicker@arr')) {
      socket.send(JSON.stringify({
        method: "SUBSCRIBE",
        params: ['!miniTicker@arr'],
        id: Date.now()
      }));
      activeStreams.add('!miniTicker@arr');
      console.log("✅ Subscribed to !miniTicker@arr (market data)");
    }
  });

  socket.on('message', (data) => {
    const msg = JSON.parse(data);
    const isCombined = msg.stream && msg.data;
    const payload = isCombined ? msg.data : msg;
    const stream = isCombined ? msg.stream : payload.e;

    if (!payload || !stream) return;

    // Kline/Candlestick updates
    if (stream.includes("kline") || payload.e === "kline") {
      const symbol = payload.k.s.toUpperCase();
      candles.set(symbol, {
        open: payload.k.o,
        high: payload.k.h,
        low: payload.k.l,
        close: payload.k.c,
        volume: payload.k.v,
        time: new Date(payload.k.t).toLocaleTimeString()
      });
    }

    // Trade updates
    else if (stream.includes("trade") || payload.e === "trade") {
      const symbol = payload.s.toUpperCase();
      const tradeData = {
        price: payload.p,
        quantity: payload.q,
        time: new Date(payload.T).toLocaleTimeString()
      };

      // Save latest trade data
      trades.set(symbol, tradeData);

      // ✅ Trigger any one-time callbacks waiting for this symbol's trade
      if (tradeListeners.has(symbol)) {
        tradeListeners.get(symbol).forEach((cb) => cb(tradeData));
        tradeListeners.delete(symbol); // only once
      }
    }

    // Depth/order book updates
    else if (stream.includes("depth") || payload.e === "depthUpdate") {
      const symbol = payload.s.toUpperCase();
      orderBooks.set(symbol, {
        bids: payload.b,
        asks: payload.a
      });
    }

    // Market summary updates
    else if (stream === '!miniTicker@arr') {
      payload.forEach(ticker => {
        const symbol = ticker.s.toUpperCase();
        const price = parseFloat(ticker.c);
        const open = parseFloat(ticker.o);
        const volume = parseFloat(ticker.v);
        const change = open ? (((price - open) / open) * 100).toFixed(2) : "0.00";

        MarketData.set(symbol, {
          symbol,
          price,
          volume,
          change,
          time: new Date().toLocaleTimeString()
        });
      });
    }
  });

  socket.on('error', (err) => {
    console.error("❌ Binance WebSocket error:", err.message);
  });

  socket.on('close', () => {
    console.warn("⚠️ Binance WebSocket disconnected.");
  });
};

export const subscribeToSymbol = (symbol) => {
  if (!symbol || !socket || socket.readyState !== WebSocket.OPEN) return;

  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@kline_1m`,
    `${sym}@depth`
  ];

  const newStreams = streams.filter(s => !activeStreams.has(s));
  if (newStreams.length === 0) return;

  socket.send(JSON.stringify({
    method: "SUBSCRIBE",
    params: newStreams,
    id: Date.now()
  }));

  newStreams.forEach(s => activeStreams.add(s));
  console.log(`✅ Subscribed to ${symbol.toUpperCase()}`);
};

export const unsubscribeFromSymbol = (symbol) => {
  if (!symbol || !socket || socket.readyState !== WebSocket.OPEN) return;

  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@kline_1m`,
    `${sym}@depth`
  ];

  const toUnsub = streams.filter(s => activeStreams.has(s));
  if (toUnsub.length === 0) return;

  socket.send(JSON.stringify({
    method: "UNSUBSCRIBE",
    params: toUnsub,
    id: Date.now()
  }));

  toUnsub.forEach(s => activeStreams.delete(s));
  console.log(`✅ Unsubscribed from ${symbol.toUpperCase()}`);
};
