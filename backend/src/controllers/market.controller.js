import { redis } from "../utils/redisClient.js";
import { getLatestPrice } from "../services/binanceFeed.service.js";

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
    const interval = req.query.interval || "1m";

    if (!symbol)
      return res.status(400).json({ success: false, message: "Symbol required" });

    const key = `kline:${symbol}:${interval}`;
    const raw = await redis.get(key);

    if (!raw)
      return res.status(404).json({ success: false, message: "No kline data found" });

    return res.status(200).json({
      success: true,
      symbol,
      interval,
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
