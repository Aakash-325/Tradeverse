import WebSocket from "ws";

const activeStreams = new Set();
const BinanceUrl = 'wss://stream.binance.com:9443/stream'; 

let socket;

const candles = new Map();
const trades = new Map();
const orderBooks = new Map();

export const getCandles = (symbol) => {
  if (!symbol) {
    console.warn("⚠️ getCandles called with no symbol");
    return null;
  }
  const key = symbol.toUpperCase();
  const data = candles.get(key);
  console.log(`📤 getCandles(${key}) →`, data ? "✅ Found" : "❌ Not Found");
  return data || null;
};

export const getTrades = (symbol) => {
  if (!symbol) {
    console.warn("⚠️ getTrades called with no symbol");
    return null;
  }
  const key = symbol.toUpperCase();
  const data = trades.get(key);
  console.log(`📤 getTrades(${key}) →`, data ? "✅ Found" : "❌ Not Found");
  return data || null;
};

export const getOrderBooks = (symbol) => {
  if (!symbol) {
    console.warn("⚠️ getOrderBooks called with no symbol");
    return null;
  }
  const key = symbol.toUpperCase();
  const data = orderBooks.get(key);
  console.log(`📤 getOrderBooks(${key}) →`, data ? "✅ Found" : "❌ Not Found");
  return data || null;
};

export const getActiveStreams = () => Array.from(activeStreams);

export const startBinanceSocket = () => {
  socket = new WebSocket(BinanceUrl);

  socket.on('open', () => {
    console.log("✅ Connected to Binance WebSocket.");
    console.log("🧪 Ready to subscribe to symbols.");
  });

  socket.on('message', (data) => {
    const msg = JSON.parse(data);

    // Detect if message is from combined stream
    const isCombined = msg.stream && msg.data;
    const payload = isCombined ? msg.data : msg;
    const stream = isCombined ? msg.stream : payload.e;

    if (!payload || !stream) {
      console.warn("⚠️ Message missing stream or data:", msg);
      return;
    }

    const symbol = (payload.s || (payload.k && payload.k.s))?.toUpperCase();
    if (!symbol) {
      console.warn("⚠️ Could not extract symbol from payload:", payload);
      return;
    }

    console.log(`📥 [${stream}] Data for ${symbol}`);

    if (stream.includes("kline") || payload.e === "kline") {
      const k = payload.k;
      const candleData = {
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
        volume: k.v,
        time: new Date(k.t).toLocaleTimeString()
      };
      candles.set(symbol, candleData);
      console.log(`✅ Candle updated for ${symbol}`);
    } else if (stream.includes("trade") || payload.e === "trade") {
      const tradeData = {
        price: payload.p,
        quantity: payload.q,
        time: new Date(payload.T).toLocaleTimeString()
      };
      trades.set(symbol, tradeData);
      console.log(`✅ Trade updated for ${symbol}`);
    } else if (stream.includes("depth") || payload.e === "depthUpdate") {
      const bookData = {
        bids: payload.b,
        asks: payload.a
      };
      orderBooks.set(symbol, bookData);
      console.log(`✅ Order book updated for ${symbol}`);
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
  if (!symbol) {
    console.warn("⚠️ subscribeToSymbol called with no symbol");
    return;
  }

  const sym = symbol.toLowerCase();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("❌ Cannot subscribe — socket not ready.");
    return;
  }

  const streams = [
    `${sym}@trade`,
    `${sym}@kline_1m`,
    `${sym}@depth`,
    `!miniTicker@arr`
  ];

  const newStreams = streams.filter(s => !activeStreams.has(s));
  if (newStreams.length === 0) {
    console.log(`ℹ️ Already subscribed to ${symbol.toUpperCase()}`);
    return;
  }

  console.log(`📡 Subscribing to streams:`, newStreams);

  socket.send(JSON.stringify({
    method: "SUBSCRIBE",
    params: newStreams,
    id: Date.now()
  }));

  newStreams.forEach(s => activeStreams.add(s));
  console.log(`✅ Subscribed to ${symbol.toUpperCase()}`);
};

export const unsubscribeFromSymbol = (symbol) => {
  if (!symbol) {
    console.warn("⚠️ unsubscribeFromSymbol called with no symbol");
    return;
  }

  const sym = symbol.toLowerCase();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.log("❌ Cannot unsubscribe — socket not ready.");
    return;
  }

  const streams = [
    `${sym}@trade`,
    `${sym}@kline_1m`,
    `${sym}@depth`,
    `!miniTicker@arr`
  ];

  const toUnsub = streams.filter(s => activeStreams.has(s));
  if (toUnsub.length === 0) {
    console.log(`ℹ️ No active streams to unsubscribe for ${symbol.toUpperCase()}`);
    return;
  }

  console.log(`🔕 Unsubscribing from streams:`, toUnsub);

  socket.send(JSON.stringify({
    method: "UNSUBSCRIBE",
    params: toUnsub,
    id: Date.now()
  }));

  toUnsub.forEach(s => activeStreams.delete(s));
  console.log(`✅ Unsubscribed from ${symbol.toUpperCase()}`);
};
