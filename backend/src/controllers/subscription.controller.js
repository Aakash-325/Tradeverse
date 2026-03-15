import { subscribeToSymbol, unsubscribeFromSymbol } from "../services/binanceFeed.service.js";

export const subscribeMarket = (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ success: false, message: "Symbol required" });
  }

  subscribeToSymbol(symbol);

  return res.status(200).json({
    success: true,
    message: `Subscribed to ${symbol}`,
  });
};

export const unsubscribeMarket = (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ success: false, message: "Symbol required" });
  }

  unsubscribeFromSymbol(symbol);

  return res.status(200).json({
    success: true,
    message: `Unsubscribed from ${symbol}`,
  });
};
