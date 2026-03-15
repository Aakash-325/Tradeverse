import WebSocket from "ws";
import { redis } from "../utils/redisClient.js";
import { config } from "../config/config.js";

const BinanceUrl = config.Binance.url;
let socket = null;

// Track active subscriptions (now memory-only, not Redis)
const activeSymbols = new Set();
const controlQueue = [];
let isProcessing = false;

// -- Message throttling (200ms per message) --
const processControlQueue = () => {
  if (isProcessing) return;
  isProcessing = true;

  const interval = setInterval(() => {
    if (controlQueue.length === 0) {
      clearInterval(interval);
      isProcessing = false;
      return;
    }
    try {
      socket?.send(JSON.stringify(controlQueue.shift()));
    } catch (err) {
      console.error("Failed to send control message:", err.message);
    }
  }, 200);
};

export const startMarketDataFeed = (io) => {
  socket = new WebSocket(BinanceUrl);

  socket.on("open", () => {
    console.log("Connected to Binance WebSocket");

    // ⛔ Removed auto-resubscription from Redis storage

    // Subscribe to global miniTicker (keep as is)
    controlQueue.push({
      method: "SUBSCRIBE",
      params: ["!miniTicker@arr"],
      id: Date.now(),
    });
    processControlQueue();
  });

  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const stream = msg.stream;
      const payload = msg.data;

      if (!payload) return;
      if (!payload.e && !Array.isArray(payload)) return;

      // 🌍 MINI TICKER (all symbols)
      if (Array.isArray(payload)) {
        const pipeline = redis.pipeline();
        const updates = [];

        for (const ticker of payload) {
          const symbol = ticker.s.toUpperCase();
          const price = parseFloat(ticker.c);
          const open = parseFloat(ticker.o);
          const volume = parseFloat(ticker.v);
          const change = open
            ? (((price - open) / open) * 100).toFixed(2)
            : "0.00";

          const data = { symbol, price, volume, change, ts: Date.now() };
          pipeline.set(`market:${symbol}`, JSON.stringify(data), "EX", 60);
          updates.push(data);
        }

        await pipeline.exec();
        io.emit("marketData", updates);
      }

      // 📊 KLINE (Live + Final Candle)
      else if (payload.e === "kline") {
        const symbol = payload.s.toUpperCase();
        const interval = payload.k.i;

        const candle = {
          time: payload.k.t,
          open: parseFloat(payload.k.o),
          high: parseFloat(payload.k.h),
          low: parseFloat(payload.k.l),
          close: parseFloat(payload.k.c),
          volume: parseFloat(payload.k.v),
          isFinal: payload.k.x,
        };

        // Store in Redis for history
        const key = `kline:${symbol}:${interval}`;
        let existing = JSON.parse((await redis.get(key)) || "[]");

        if (
          existing.length &&
          existing[existing.length - 1].time === candle.time
        ) {
          existing[existing.length - 1] = candle;
        } else {
          existing.push(candle);
          if (existing.length > 200) existing.shift();
        }
        await redis.set(key, JSON.stringify(existing), "EX", 86400);

        io.to(symbol).emit(`kline-${symbol}-${interval}`, candle);
      }

      // 📘 DEPTH
      else if (stream?.includes("depth") || payload.e === "depthUpdate") {
        const symbol = payload.s.toUpperCase();
        const depth = {
          bids: payload.b.slice(0, 10).map(([p, q]) => ({
            price: +p,
            quantity: +q,
          })),
          asks: payload.a.slice(0, 10).map(([p, q]) => ({
            price: +p,
            quantity: +q,
          })),
          ts: Date.now(),
        };

        await redis.set(`depth:${symbol}`, JSON.stringify(depth), "EX", 30);
        io.to(symbol).emit(`depth-${symbol}`, depth);
      }

      // 💹 TRADE
      else if (stream?.includes("trade") || payload.e === "trade") {
        const symbol = payload.s.toUpperCase();
        const trade = {
          tradeId: payload.t,
          price: +payload.p,
          quantity: +payload.q,
          ts: payload.T,
        };

        const key = `trades:${symbol}`;
        let existing = JSON.parse((await redis.get(key)) || "[]");
        existing.push(trade);
        if (existing.length > 50) existing.shift();

        await redis.set(key, JSON.stringify(existing), "EX", 30);
        io.to(symbol).emit(`trade-${symbol}`, trade);
      }
    } catch (err) {
      console.error(" Binance message error:", err.message);
    }
  });

  socket.on("error", (err) => console.error(" Binance WS error:", err.message));

  socket.on("close", () => {
    console.warn(" Binance WS disconnected. Reconnecting...");
    setTimeout(() => startMarketDataFeed(io), 3000);
  });
};

// Subscribe only when frontend requests
export const subscribeToSymbol = async (symbol) => {
  const sym = symbol.toLowerCase();
  if (activeSymbols.has(sym)) return;
  activeSymbols.add(sym);

  const params = [`${sym}@kline_1m`, `${sym}@depth@100ms`, `${sym}@trade`];
  controlQueue.push({ method: "SUBSCRIBE", params, id: Date.now() });
  processControlQueue();

  console.log(`✔ Subscribed to ${symbol.toUpperCase()}`);
};

// Unsubscribe properly when no user needs it
export const unsubscribeFromSymbol = async (symbol) => {
  const sym = symbol.toLowerCase();
  if (!activeSymbols.has(sym)) return;

  activeSymbols.delete(sym);

  const params = [`${sym}@kline_1m`, `${sym}@depth@100ms`, `${sym}@trade`];
  controlQueue.push({ method: "UNSUBSCRIBE", params, id: Date.now() });
  processControlQueue();

  console.log(`✖ Unsubscribed from ${symbol.toUpperCase()}`);
};

export const getLatestPrice = async (symbol) => {
  const raw = await redis.get(`market:${symbol.toUpperCase()}`);
  return raw ? JSON.parse(raw) : null;
};
