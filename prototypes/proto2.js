import { subscribeToSymbol, onTradeUpdate } from "../services/binance.service.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Trade from "../models/trade.model.js";
import Portfolio from "../models/portfolio.model.js";

// ✅ Buy Order using onTradeUpdate (real-time listener)
export const buyOrder = async (req, res) => {
  const { symbol, quantity, tradeType } = req.body;
  const userId = req.user.userId;

  if (!symbol || !quantity || !tradeType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!["INTRADAY", "LONG_TERM"].includes(tradeType)) {
    return res.status(400).json({ message: "Invalid trade type." });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0." });
  }

  try {
    const symbolUpper = symbol.toUpperCase();
    subscribeToSymbol(symbolUpper); // ensure real-time updates are coming

    // 🕒 Wait for live trade data (via WebSocket)
    const tradeData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("⏰ No trade data received in time."));
      }, 3000); // wait max 3 seconds

      // This callback runs when first trade data arrives
      onTradeUpdate(symbolUpper, (data) => {
        clearTimeout(timeout); // stop timeout
        resolve(data);         // continue with data
      });
    });

    const currentPrice = parseFloat(tradeData.price);
    const qty = parseFloat(quantity);
    const total = currentPrice * qty;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.balance < total) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    user.balance -= total;
    await user.save();

    const order = new Order({
      user: userId,
      symbol: symbolUpper,
      side: "BUY",
      price: currentPrice,
      quantity: qty,
      tradeType,
      orderStatus: "FILLED",
    });

    const trade = new Trade({
      user: userId,
      symbol: symbolUpper,
      side: "BUY",
      price: currentPrice,
      quantity: qty,
      tradeType,
      total,
    });

    let portfolio = await Portfolio.findOne({ user: userId, symbol: symbolUpper, tradeType });

    if (portfolio) {
      const oldQty = portfolio.quantity;
      const oldAvg = portfolio.avgBuyPrice;

      const newQty = oldQty + qty;
      const newAvg = ((oldQty * oldAvg) + (qty * currentPrice)) / newQty;

      portfolio.quantity = newQty;
      portfolio.avgBuyPrice = newAvg;
    } else {
      portfolio = new Portfolio({
        user: userId,
        symbol: symbolUpper,
        quantity: qty,
        avgBuyPrice: currentPrice,
        tradeType,
      });
    }

    await order.save();
    await trade.save();
    await portfolio.save();

    return res.status(200).json({
      message: "✅ Buy order filled successfully.",
      order,
      trade,
      portfolio,
    });
  } catch (error) {
    console.error("❌ Buy order failed:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ✅ Sell Order (uses current trade price from memory)
export const sellOrder = async (req, res) => {
  const { symbol, quantity, tradeType } = req.body;
  const userId = req.user.userId;

  if (!symbol || !quantity || !tradeType) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!["INTRADAY", "LONG_TERM"].includes(tradeType)) {
    return res.status(400).json({ message: "Invalid trade type." });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0." });
  }

  try {
    const symbolUpper = symbol.toUpperCase();
    subscribeToSymbol(symbolUpper);

    const data = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Price data unavailable.")), 3000);
      onTradeUpdate(symbolUpper, (trade) => {
        clearTimeout(timeout);
        resolve(trade);
      });
    });

    if (!data || !data.price) {
      return res.status(500).json({ message: "Trade data unavailable." });
    }

    const currentPrice = parseFloat(data.price);
    const qty = parseFloat(quantity);
    const total = currentPrice * qty;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const portfolio = await Portfolio.findOne({ user: userId, symbol: symbolUpper, tradeType });
    if (!portfolio || portfolio.quantity < qty) {
      return res.status(400).json({ message: "Insufficient holdings to sell." });
    }

    portfolio.quantity -= qty;

    if (portfolio.quantity === 0) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      await portfolio.save();
    }

    const order = new Order({
      user: userId,
      symbol: symbolUpper,
      side: "SELL",
      price: currentPrice,
      quantity: qty,
      tradeType,
      status: "FILLED",
    });

    const trade = new Trade({
      user: userId,
      symbol: symbolUpper,
      side: "SELL",
      price: currentPrice,
      quantity: qty,
      tradeType,
      total,
    });

    user.balance += total;
    await user.save();

    await order.save();
    await trade.save();

    return res.status(200).json({
      message: "✅ Sell order filled successfully.",
      order,
      trade,
      portfolio: portfolio.quantity ? portfolio : null,
    });
  } catch (error) {
    console.error("❌ Sell order failed:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
