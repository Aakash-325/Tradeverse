import WebSocket from "ws";
import { config } from "../config/config.js";

const BinanceUrl = config.Binance.url;
let socket;
let ioInstance = null;
const activeStreams = new Set();

const candles = new Map();     // symbol -> { interval -> array }
const trades = new Map();      // symbol -> { price, quantity, time }
const orderBooks = new Map();  // symbol -> { bids, asks }
const MarketData = new Map();  // symbol -> { price, volume, change }
const tradeListeners = new Map();

// Set IO instance
export const setSocketIO = (io) => {
  ioInstance = io;
};

// Utils
const parseKline = (k) => ({
  open: k.o,
  high: k.h,
  low: k.l,
  close: k.c,
  volume: k.v,
  time: k.t,
});

// Getters
export const getCandles = (symbol, interval = "1m") =>
  candles.get(symbol?.toUpperCase())?.[interval] || [];

export const getTrades = (symbol) =>
  trades.get(symbol?.toUpperCase()) || null;

export const getOrderBooks = (symbol) =>
  orderBooks.get(symbol?.toUpperCase()) || null;

export const getMarketData = () => Array.from(MarketData.values());
export const getActiveStreams = () => Array.from(activeStreams);

// Listener callback on first trade update
export const onTradeUpdate = (symbol, callback) => {
  const key = symbol.toUpperCase();
  if (!tradeListeners.has(key)) tradeListeners.set(key, []);
  tradeListeners.get(key).push(callback);
};

// Start Socket
export const startBinanceSocket = () => {
  socket = new WebSocket(BinanceUrl);

  socket.on("open", () => {
    console.log("✅ Connected to Binance WebSocket.");
    subscribeStreams(["!miniTicker@arr"]);
  });

  socket.on("message", (data) => {
    const msg = JSON.parse(data);
    const stream = msg.stream || msg?.e;
    const payload = msg.data || msg;

    if (!stream || !payload) return;

    switch (true) {
      case stream.includes("kline") || payload.e === "kline": {
        const symbol = payload.k.s.toUpperCase();
        const interval = payload.k.i;
        const parsed = parseKline(payload.k);

        if (!candles.has(symbol)) candles.set(symbol, {});
        if (!candles.get(symbol)[interval]) candles.get(symbol)[interval] = [];

        const arr = candles.get(symbol)[interval];
        const last = arr[arr.length - 1];

        if (last?.time === parsed.time) {
          arr[arr.length - 1] = parsed;
        } else {
          arr.push(parsed);
          if (arr.length > 100) arr.shift();
        }

        ioInstance?.emit(`kline-${symbol}-${interval}`, arr);
        break;
      }

      case stream.includes("trade") || payload.e === "trade": {
        const symbol = payload.s.toUpperCase();
        const trade = {
          price: payload.p,
          quantity: payload.q,
          time: payload.T,
        };

        trades.set(symbol, trade);
        ioInstance?.emit(`trade-${symbol}`, trade);

        if (tradeListeners.has(symbol)) {
          tradeListeners.get(symbol).forEach((cb) => cb(trade));
          tradeListeners.delete(symbol);
        }

        break;
      }

      case stream.includes("depth") || payload.e === "depthUpdate": {
        const symbol = payload.s.toUpperCase();
        const format = (arr) =>
          arr.slice(0, 10).map(([p, q]) => ({
            price: parseFloat(p),
            quantity: parseFloat(q),
          }));

        const depth = {
          bids: format(payload.b),
          asks: format(payload.a),
        };

        orderBooks.set(symbol, depth);
        ioInstance?.emit(`depth-${symbol}`, depth);
        break;
      }

      case stream === "!miniTicker@arr": {
        payload.forEach((ticker) => {
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
            time: Date.now(),
          });
        });

        ioInstance?.emit("marketData", getMarketData());
        break;
      }
    }
  });

  socket.on("error", (err) =>
    console.error("❌ Binance WebSocket error:", err.message)
  );

  socket.on("close", () =>
    console.warn("⚠️ Binance WebSocket disconnected.")
  );
};

// Stream manager
const subscribeStreams = (streams) => {
  const newStreams = streams.filter((s) => !activeStreams.has(s));
  if (!newStreams.length || !socket || socket.readyState !== WebSocket.OPEN)
    return;

  socket.send(
    JSON.stringify({
      method: "SUBSCRIBE",
      params: newStreams,
      id: Date.now(),
    })
  );

  newStreams.forEach((s) => activeStreams.add(s));
};

const unsubscribeStreams = (streams) => {
  const existing = streams.filter((s) => activeStreams.has(s));
  if (!existing.length || !socket || socket.readyState !== WebSocket.OPEN)
    return;

  socket.send(
    JSON.stringify({
      method: "UNSUBSCRIBE",
      params: existing,
      id: Date.now(),
    })
  );

  existing.forEach((s) => activeStreams.delete(s));
};

// Public API
export const subscribeToSymbol = (symbol, intervals = ["1m"]) => {
  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@depth`,
    ...intervals.map((i) => `${sym}@kline_${i}`),
  ];
  subscribeStreams(streams);
  console.log(`✅ Subscribed to ${symbol.toUpperCase()} (${intervals.join(", ")})`);
};

export const unsubscribeFromSymbol = (symbol, intervals = ["1m"]) => {
  const sym = symbol.toLowerCase();
  const streams = [
    `${sym}@trade`,
    `${sym}@depth`,
    ...intervals.map((i) => `${sym}@kline_${i}`),
  ];
  unsubscribeStreams(streams);
  console.log(`✅ Unsubscribed from ${symbol.toUpperCase()}`);
};
