// services/tradingEngine.service.js
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Trade from "../models/trade.model.js";
import Portfolio from "../models/portfolio.model.js";
import { getLatestPrice } from "./binanceFeed.service.js";

/**
 * Executes a market order instantly using the latest Redis price.
 * Emits live updates via Socket.IO for order, trade, portfolio & PnL.
 */
export const executeMarketOrder = async (userId, symbol, side, quantity, tradeType, io) => {
  try {
    // 0️⃣ Basic sanity checks
    if (!symbol || !side || !quantity || quantity <= 0)
      throw new Error("Invalid order parameters");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const symb = symbol.toUpperCase();
    const baseAsset = symb.replace("USDT", "");
    const quoteAsset = "USDT";

    // 1️⃣ Get current market price
    const marketData = await getLatestPrice(symb);
    if (!marketData) throw new Error("No market data available for " + symb);

    if (Date.now() - marketData.ts > 10000)
      throw new Error("Stale market data, please retry");

    const price = parseFloat(marketData.price);
    const total = price * quantity;

    // 2️⃣ Check wallet balances
    const wallet = user.wallet;
    const quoteBalance = wallet.get(quoteAsset) || 0;
    const baseBalance = wallet.get(baseAsset) || 0;

    if (side === "BUY" && quoteBalance < total)
      throw new Error(`Insufficient ${quoteAsset} balance`);
    if (side === "SELL" && baseBalance < quantity)
      throw new Error(`Insufficient ${baseAsset} balance`);

    // 3️⃣ Create Order record
    const order = await Order.create({
      user: user._id,
      symbol: symb,
      side,
      orderType: "MARKET",
      price,
      quantity,
      total,
      status: "FILLED",
      tradeType,
    });

    // 🟢 Emit order fill event
    io.to(userId).emit("order:filled", order);

    let trade;
    let realizedPnL = 0;

    // 4️⃣ Update Wallet and Create Trade
    if (side === "BUY") {
      wallet.set(quoteAsset, quoteBalance - total);
      wallet.set(baseAsset, baseBalance + quantity);

      trade = await Trade.create({
        user: user._id,
        order: order._id,
        symbol: symb,
        side,
        price,
        quantity,
        total,
        tradeType,
        realizedPnL: 0,
      });
    } else if (side === "SELL") {
      wallet.set(baseAsset, baseBalance - quantity);
      wallet.set(quoteAsset, quoteBalance + total);

      // Portfolio check
      let portfolio = await Portfolio.findOne({
        user: user._id,
        symbol: symb,
        tradeType,
      });

      if (!portfolio || portfolio.quantity < quantity)
        throw new Error("Insufficient holdings to sell");

      const avgBuy = portfolio.avgBuyPrice;
      realizedPnL = (price - avgBuy) * quantity;

      portfolio.quantity -= quantity;
      if (portfolio.quantity <= 0) {
        await Portfolio.deleteOne({ _id: portfolio._id });
        io.to(userId).emit("portfolio:closed", symb);
      } else {
        await portfolio.save();
        io.to(userId).emit("portfolio:updated", portfolio);
      }

      // Record trade with PnL
      trade = await Trade.create({
        user: user._id,
        order: order._id,
        symbol: symb,
        side,
        price,
        quantity,
        total,
        tradeType,
        realizedPnL,
      });

      user.totalRealizedPnL = (user.totalRealizedPnL || 0) + realizedPnL;

      // 🧮 Emit PnL update event
      io.to(userId).emit("pnl:update", {
        symbol: symb,
        realizedPnL,
        totalRealizedPnL: user.totalRealizedPnL,
      });
    }

    // 5️⃣ Save wallet + lifetime PnL
    await user.save();

    // 6️⃣ Update portfolio on BUY
    if (side === "BUY") {
      let portfolio = await Portfolio.findOne({
        user: user._id,
        symbol: symb,
        tradeType,
      });

      if (portfolio) {
        const newQty = portfolio.quantity + quantity;
        const newAvg = (portfolio.quantity * portfolio.avgBuyPrice + quantity * price) / newQty;
        portfolio.quantity = newQty;
        portfolio.avgBuyPrice = newAvg;
      } else {
        portfolio = new Portfolio({
          user: user._id,
          symbol: symb,
          baseAsset,
          quoteAsset,
          quantity,
          avgBuyPrice: price,
          tradeType,
        });
      }
      await portfolio.save();

      io.to(userId).emit("portfolio:updated", portfolio);
    }

    // 7️⃣ Emit trade execution
    io.to(userId).emit("trade:executed", {
      trade,
      message:
        side === "SELL"
          ? `${side} ${quantity} ${baseAsset} @ ${price} executed successfully (PnL: ${realizedPnL.toFixed(2)} USDT)`
          : `${side} ${quantity} ${baseAsset} @ ${price} executed successfully`,
    });

    // 8️⃣ Return summary to controller
    return {
      message:
        side === "SELL"
          ? `${side} ${quantity} ${baseAsset} @ ${price} executed successfully (PnL: ${realizedPnL.toFixed(
              2
            )} USDT)`
          : `${side} ${quantity} ${baseAsset} @ ${price} executed successfully`,
      order,
      trade,
      realizedPnL,
      updatedWallet: user.wallet,
    };
  } catch (error) {
    console.error("❌ executeMarketOrder Error:", error.message);
    throw new Error(error.message);
  }
};
