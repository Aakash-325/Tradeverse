import { redis } from "../utils/redisClient.js";
import axios from "axios";
import { getLatestPrice } from "../services/binanceFeed.service.js";

// Binance REST Fallback
const fetchKlineFromBinance = async (symbol, interval = "1m") => {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`;
  const res = await axios.get(url);
  return res.data.map((c) => ({
    time: c[0],
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }));
};

/**
 * GET /market/price?symbol=BTCUSDT
 */
export const getMarketPrice = async (req, res) => {
  try {
    const symbol = req.query.symbol?.toUpperCase();
    if (!symbol)
      return res.status(400).json({ success: false, message: "Symbol required" });

    const data = await getLatestPrice(symbol);

    if (!data)
      return res.status(404).json({ success: false, message: "Price not found" });

    // Refresh TTL for frequently accessed data
    await redis.expire(`market:${symbol}`, 60);

    return res.status(200).json({
      success: true,
      symbol,
      price: parseFloat(data.price),
      ts: data.ts,
    });
  } catch (error) {
    console.error("❌ getMarketPrice Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /market/kline?symbol=BTCUSDT&interval=1m
 */
export const getKline = async (req, res) => {
  try {
    const symbol = req.query.symbol?.toUpperCase();
    let interval = (req.query.interval || "1m").toLowerCase();

    if (!symbol)
      return res.status(400).json({ success: false, message: "Symbol required" });

    const key = `kline:${symbol}:${interval}`;
    let raw = await redis.get(key);

    if (!raw) {
      // 🔁 Fallback to Binance REST if Redis empty
      const apiData = await fetchKlineFromBinance(symbol, interval);
      await redis.set(key, JSON.stringify(apiData), "EX", 86400);
      return res.status(200).json({
        success: true,
        symbol,
        interval,
        source: "binance_rest",
        candles: apiData,
      });
    }

    // Extend TTL when accessed
    await redis.expire(key, 86400);

    return res.status(200).json({
      success: true,
      symbol,
      interval,
      source: "redis",
      candles: JSON.parse(raw),
    });
  } catch (error) {
    console.error("❌ getKline Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /market/depth?symbol=BTCUSDT
 */
export const getDepth = async (req, res) => {
  try {
    const symbol = req.query.symbol?.toUpperCase();

    if (!symbol)
      return res.status(400).json({ success: false, message: "Symbol required" });

    const key = `depth:${symbol}`;
    const raw = await redis.get(key);

    if (!raw)
      return res.status(404).json({ success: false, message: "No depth data" });

    await redis.expire(key, 30);

    return res.status(200).json({
      success: true,
      symbol,
      depth: JSON.parse(raw),
    });
  } catch (error) {
    console.error("❌ getDepth Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /market/trades?symbol=BTCUSDT
 */
export const getTrades = async (req, res) => {
  try {
    const symbol = req.query.symbol?.toUpperCase();

    if (!symbol)
      return res.status(400).json({ success: false, message: "Symbol required" });

    const key = `trades:${symbol}`;
    const raw = await redis.get(key);

    if (!raw)
      return res.status(404).json({ success: false, message: "No trade data" });

    await redis.expire(key, 30);

    return res.status(200).json({
      success: true,
      symbol,
      trades: JSON.parse(raw),
    });
  } catch (error) {
    console.error("❌ getTrades Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
