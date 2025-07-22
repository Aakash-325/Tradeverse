import { subscribeToSymbol, getTrades } from "../services/binance.service.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Trade from "../models/trade.model.js";
import Portfolio from "../models/portfolio.model.js";

const waitForTradeData = (symbol, retries = 5, delay = 500) =>
  new Promise((resolve, reject) => {
    let count = 0;
    const check = () => {
      const data = getTrades(symbol);
      if (data && data.price) return resolve(data);
      if (++count >= retries) return reject(new Error("Price data unavailable."));
      setTimeout(check, delay);
    };
    check();
  });

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
    subscribeToSymbol(symbolUpper);

    subscribeToSymbol(symbolUpper);

    let data;
    try {
      data = await waitForTradeData(symbolUpper);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }

    const currentPrice = parseFloat(data.price);
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
    console.error("Buy order failed:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

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

    const data = getTrades(symbolUpper);
    if (!data || !data.price) {
      return res.status(500).json({ message: "Price data unavailable." });
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
