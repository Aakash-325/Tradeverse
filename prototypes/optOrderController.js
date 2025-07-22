import { subscribeToSymbol, onTradeUpdate } from "../services/binance.service.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Trade from "../models/trade.model.js";
import Portfolio from "../models/portfolio.model.js";
import { ioInstance } from "../socket.js"; // ✅ Ensure this is your socket instance

const validateOrderInput = ({ symbol, quantity, tradeType }) => {
  if (!symbol || !quantity || !tradeType) {
    return "All fields are required.";
  }
  if (!["INTRADAY", "LONG_TERM"].includes(tradeType)) {
    return "Invalid trade type.";
  }
  if (quantity <= 0) {
    return "Quantity must be greater than 0.";
  }
  return null;
};

export const buyOrder = async (req, res) => {
  const { symbol, quantity, tradeType } = req.body;
  const userId = req.user.userId;
  const error = validateOrderInput({ symbol, quantity, tradeType });
  if (error) return res.status(400).json({ message: error });

  const symbolUpper = symbol.toUpperCase();
  const qty = parseFloat(quantity);

  try {
    subscribeToSymbol(symbolUpper);

    const tradeData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("No trade data.")), 3000);
      onTradeUpdate(symbolUpper, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    const price = parseFloat(tradeData.price);
    const total = price * qty;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.balance < total) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    user.balance -= total;
    await user.save();

    const order = await Order.create({
      user: userId, symbol: symbolUpper, side: "BUY",
      price, quantity: qty, tradeType, orderStatus: "FILLED",
    });

    const trade = await Trade.create({
      user: userId, symbol: symbolUpper, side: "BUY",
      price, quantity: qty, tradeType, total,
    });

    let portfolio = await Portfolio.findOne({ user: userId, symbol: symbolUpper, tradeType });
    if (portfolio) {
      const totalQty = portfolio.quantity + qty;
      portfolio.avgBuyPrice = ((portfolio.quantity * portfolio.avgBuyPrice) + (qty * price)) / totalQty;
      portfolio.quantity = totalQty;
    } else {
      portfolio = new Portfolio({
        user: userId, symbol: symbolUpper, quantity: qty,
        avgBuyPrice: price, tradeType,
      });
    }
    await portfolio.save();

    // ✅ Emit updates
    ioInstance.to(userId).emit("orderUpdate", order);
    ioInstance.to(userId).emit("portfolioUpdate", portfolio);

    res.status(200).json({ message: "✅ Buy order filled.", order, trade, portfolio });
  } catch (error) {
    console.error("❌ Buy error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const sellOrder = async (req, res) => {
  const { symbol, quantity, tradeType } = req.body;
  const userId = req.user.userId;
  const error = validateOrderInput({ symbol, quantity, tradeType });
  if (error) return res.status(400).json({ message: error });

  const symbolUpper = symbol.toUpperCase();
  const qty = parseFloat(quantity);

  try {
    subscribeToSymbol(symbolUpper);

    const tradeData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("No trade data.")), 3000);
      onTradeUpdate(symbolUpper, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    const price = parseFloat(tradeData.price);
    const total = price * qty;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const portfolio = await Portfolio.findOne({ user: userId, symbol: symbolUpper, tradeType });
    if (!portfolio || portfolio.quantity < qty) {
      return res.status(400).json({ message: "Insufficient holdings to sell." });
    }

    portfolio.quantity -= qty;
    const portfolioDeleted = portfolio.quantity === 0;

    const order = await Order.create({
      user: userId, symbol: symbolUpper, side: "SELL",
      price, quantity: qty, tradeType, orderStatus: "FILLED",
    });

    const trade = await Trade.create({
      user: userId, symbol: symbolUpper, side: "SELL",
      price, quantity: qty, tradeType, total,
    });

    user.balance += total;
    await user.save();

    if (portfolioDeleted) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      await portfolio.save();
    }

    // ✅ Emit updates
    ioInstance.to(userId).emit("orderUpdate", order);
    ioInstance.to(userId).emit("portfolioUpdate", portfolioDeleted ? null : portfolio);

    res.status(200).json({ message: "✅ Sell order filled.", order, trade, portfolio: portfolioDeleted ? null : portfolio });
  } catch (error) {
    console.error("❌ Sell error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
