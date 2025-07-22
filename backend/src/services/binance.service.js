import WebSocket from "ws";
import { config } from "../config/config.js";

const BinanceUrl = config.Binance.url;
const activeStreams = new Set();
let ioInstance = null;
let socket;

// In-memory storage
const candles = new Map();       // symbol -> { interval -> array of candles }
const trades = new Map();        // symbol -> latest trade
const orderBooks = new Map();    // symbol -> { bids, asks }
const MarketData = new Map();    // symbol -> { price, volume, change }

const tradeListeners = new Map();

// Init IO
export const setSocketIO = (io) => {
  ioInstance = io;
};

// Utility
const parseKline = (k) => ({
  open: k.o,
  high: k.h,
  low: k.l,
  close: k.c,
  volume: k.v,
  time: k.t,
});

// ========== GETTERS ==========
export const getCandles = (symbol, interval = "1m") => {
  const key = symbol?.toUpperCase();
  return candles.get(key)?.[interval] || [];
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

export const onTradeUpdate = (symbol, callback) => {
  const key = symbol.toUpperCase();
  if (!tradeListeners.has(key)) tradeListeners.set(key, []);
  tradeListeners.get(key).push(callback);
};

// ========== START SOCKET ==========
export const startBinanceSocket = () => {
  socket = new WebSocket(BinanceUrl);

  socket.on("open", () => {
    console.log("✅ Connected to Binance WebSocket.");
    if (!activeStreams.has("!miniTicker@arr")) {
      socket.send(JSON.stringify({
        method: "SUBSCRIBE",
        params: ["!miniTicker@arr"],
        id: Date.now()
      }));
      activeStreams.add("!miniTicker@arr");
      console.log("✅ Subscribed to !miniTicker@arr");
    }
  });

  socket.on("message", (data) => {
    const msg = JSON.parse(data);
    const payload = msg.data || msg;
    const stream = msg.stream || payload.e;

    if (!payload || !stream) return;

    // ---------- KLINE ----------
    if (stream.includes("kline") || payload.e === "kline") {
      const symbol = payload.k.s.toUpperCase();
      const interval = payload.k.i;
      const parsed = parseKline(payload.k);

      if (!candles.has(symbol)) candles.set(symbol, {});
      if (!candles.get(symbol)[interval]) candles.get(symbol)[interval] = [];

      const arr = candles.get(symbol)[interval];
      const lastIndex = arr.length - 1;

      if (arr.length && arr[lastIndex].time === parsed.time) {
        arr[lastIndex] = parsed;
      } else {
        arr.push(parsed);
        if (arr.length > 100) arr.shift(); // limit size
      }

      ioInstance?.emit(`kline-${symbol}-${interval}`, candles.get(symbol)[interval]);
    }

    // ---------- TRADE ----------
    else if (stream.includes("trade") || payload.e === "trade") {
      const symbol = payload.s.toUpperCase();
      const tradeData = {
        price: payload.p,
        quantity: payload.q,
        time: payload.T
      };

      trades.set(symbol, tradeData);
      if (tradeListeners.has(symbol)) {
        tradeListeners.get(symbol).forEach(cb => cb(tradeData));
        tradeListeners.delete(symbol);
      }

      ioInstance?.emit(`trade-${symbol}`, tradeData);
    }

    // ---------- DEPTH ----------
    else if (stream.includes("depth") || payload.e === "depthUpdate") {
      const symbol = payload.s.toUpperCase();
      const format = (arr) =>
        arr.slice(0, 10).map(([price, qty]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty)
        }));

      const depthData = {
        bids: format(payload.b),
        asks: format(payload.a)
      };

      orderBooks.set(symbol, depthData);
      ioInstance?.emit(`depth-${symbol}`, depthData);
    }

    // ---------- MARKET ----------
    else if (stream === "!miniTicker@arr") {
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
          time: Date.now()
        });
      });

      ioInstance?.emit("marketData", getMarketData());
    }
  });

  socket.on("error", (err) => console.error("❌ Binance WebSocket error:", err.message));
  socket.on("close", () => console.warn("⚠️ Binance WebSocket disconnected."));
};

// ========== SUBSCRIBE/UNSUBSCRIBE ==========
export const subscribeToSymbol = (symbol, intervals = ["1m"]) => {
  if (!symbol || !socket || socket.readyState !== WebSocket.OPEN) return;

  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@depth`,
    ...intervals.map((i) => `${sym}@kline_${i}`)
  ];

  const newStreams = streams.filter(s => !activeStreams.has(s));
  if (!newStreams.length) return;

  socket.send(JSON.stringify({
    method: "SUBSCRIBE",
    params: newStreams,
    id: Date.now()
  }));

  newStreams.forEach(s => activeStreams.add(s));
  console.log(`✅ Subscribed to ${symbol.toUpperCase()} [${intervals.join(", ")}]`);
};

export const unsubscribeFromSymbol = (symbol, intervals = ["1m"]) => {
  if (!symbol || !socket || socket.readyState !== WebSocket.OPEN) return;

  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@depth`,
    ...intervals.map((i) => `${sym}@kline_${i}`)
  ];

  const toUnsub = streams.filter(s => activeStreams.has(s));
  if (!toUnsub.length) return;

  socket.send(JSON.stringify({
    method: "UNSUBSCRIBE",
    params: toUnsub,
    id: Date.now()
  }));

  toUnsub.forEach(s => activeStreams.delete(s));
  console.log(`✅ Unsubscribed from ${symbol.toUpperCase()}`);
};
