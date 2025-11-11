import WebSocket from "ws";
import { redis } from "../utils/redisClient.js";
import { config } from "../config/config.js";

const BinanceUrl = config.Binance.url;
let socket = null;

// Track which streams are currently subscribed
const activeSymbols = new Set();

// Control message queue (to stay under 5 messages/sec)
const controlQueue = [];
let isProcessing = false;

// Throttler for control messages (5/sec → one every 200ms)
const processControlQueue = () => {
  if (isProcessing) return;
  isProcessing = true;

  const interval = setInterval(() => {
    if (controlQueue.length === 0) {
      clearInterval(interval);
      isProcessing = false;
      return;
    }
    const msg = controlQueue.shift();
    try {
      socket?.send(JSON.stringify(msg));
    } catch (err) {
      console.error("❌ Failed to send control message:", err.message);
    }
  }, 200);
};


export const startMarketDataFeed = (io) => {
  socket = new WebSocket(BinanceUrl);

  socket.on("open", () => {
    console.log("✅ Connected to Binance WebSocket");


    const params = ["!miniTicker@arr"];
    controlQueue.push({ method: "SUBSCRIBE", params, id: Date.now() });
    processControlQueue();
    console.log("📡 Subscribed to !miniTicker@arr");
  });

  socket.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw);
      const stream = msg.stream;
      const payload = msg.data;

     // ================== DEBUG LOGGING (comment/uncomment as needed) ==================

    // 🟢 Global miniTicker (all symbols)
    // if (stream === "!miniTicker@arr") {
    //   console.log("🌍 MINI TICKER (All Symbols):");
    //   console.log(JSON.stringify(payload, null, 2));
    // }

    // // 🔵 Kline (candlestick updates)
    // if (stream?.includes("kline") || payload.e === "kline") {
    //   console.log("📊 KLINE Message:");
    //   console.log(JSON.stringify(payload, null, 2));
    // }

    // // 🟠 Depth (order book updates)
    // if (stream?.includes("depth") || payload.e === "depthUpdate") {
    //   console.log("📘 DEPTH Message:");
    //   console.log(JSON.stringify(payload, null, 2));
    // }

    // // 🔴 Trade (individual trades)
    // if (stream?.includes("trade") || payload.e === "trade") {
    //   console.log("💹 TRADE Message:");
    //   console.log(JSON.stringify(payload, null, 2));
    // }

    // =================================================================================


      //  GLOBAL MINI TICKER 
      if (Array.isArray(payload)) {
        const pipeline = redis.pipeline();
        const updates = [];

        for (const ticker of payload) {
          const symbol = ticker.s.toUpperCase();
          const price = parseFloat(ticker.c);
          const open = parseFloat(ticker.o);
          const volume = parseFloat(ticker.v);
          const change = open ? (((price - open) / open) * 100).toFixed(2) : "0.00";

          const data = { symbol, price, volume, change, ts: Date.now() };
          pipeline.set(`market:${symbol}`, JSON.stringify(data));
          updates.push(data);
        }

        await pipeline.exec();
        io.emit("marketData", updates);
      }

      //   KLINE (Candlesticks) 
      else if (stream?.includes("kline") || payload.e === "kline") {
        const symbol = payload.s.toUpperCase();
        const interval = payload.k.i;
        const candle = {
          time: payload.k.t,
          open: parseFloat(payload.k.o),
          high: parseFloat(payload.k.h),
          low: parseFloat(payload.k.l),
          close: parseFloat(payload.k.c),
          volume: parseFloat(payload.k.v),
        };

        const key = `kline:${symbol}:${interval}`;
        const existing = JSON.parse((await redis.get(key)) || "[]");
        if (existing.length && existing[existing.length - 1].time === candle.time)
          existing[existing.length - 1] = candle;
        else {
          existing.push(candle);
          if (existing.length > 100) existing.shift();
        }

        await redis.set(key, JSON.stringify(existing));
        io.emit(`kline-${symbol}-${interval}`, existing);
      }

      //  DEPTH (Order Book) 
      else if (stream?.includes("depth") || payload.e === "depthUpdate") {
        const symbol = payload.s.toUpperCase();
        const format = (arr) =>
          arr.slice(0, 10).map(([price, qty]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty),
          }));

        const depth = {
          bids: format(payload.b),
          asks: format(payload.a),
          ts: Date.now(),
        };

        await redis.set(`depth:${symbol}`, JSON.stringify(depth));
        io.emit(`depth-${symbol}`, depth);
      }

      //  TRADE (Recent Trades / Tape) 
      else if (stream?.includes("trade") || payload.e === "trade") {
        const symbol = payload.s.toUpperCase();
        const trade = {
          tradeId: payload.t,
          price: parseFloat(payload.p),
          quantity: parseFloat(payload.q),
          ts: payload.T,
        };

        const key = `trades:${symbol}`;
        const existing = JSON.parse((await redis.get(key)) || "[]");
        existing.push(trade);
        if (existing.length > 50) existing.shift();

        await redis.set(key, JSON.stringify(existing));
        io.emit(`trade-${symbol}`, trade);
      }
    } catch (err) {
      console.error("⚠️ Binance message error:", err.message);
    }
  });

  socket.on("error", (err) => {
    console.error("❌ Binance WS error:", err.message);
  });

  socket.on("close", () => {
    console.warn("⚠️ Binance WebSocket disconnected. Attempting reconnect...");
    setTimeout(() => startMarketDataFeed(io), 3000);
  });
};

export const subscribeToSymbol = (symbol) => {
  const sym = symbol.toLowerCase();
  if (activeSymbols.has(sym)) return;

  const params = [
    `${sym}@kline_1m`,
    `${sym}@depth@100ms`,
    `${sym}@trade`,
  ];

  controlQueue.push({ method: "SUBSCRIBE", params, id: Date.now() });
  processControlQueue();
  activeSymbols.add(sym);
  console.log(`✅ Subscribed to ${symbol.toUpperCase()}`);
};

export const unsubscribeFromSymbol = (symbol) => {
  const sym = symbol.toLowerCase();
  if (!activeSymbols.has(sym)) return;

  const params = [
    `${sym}@kline_1m`,
    `${sym}@depth@100ms`,
    `${sym}@trade`,
  ];

  controlQueue.push({ method: "UNSUBSCRIBE", params, id: Date.now() });
  processControlQueue();
  activeSymbols.delete(sym);
  console.log(`🛑 Unsubscribed from ${symbol.toUpperCase()}`);
};

export const getLatestPrice = async (symbol) => {
  const raw = await redis.get(`market:${symbol.toUpperCase()}`);
  return raw ? JSON.parse(raw) : null;
};
