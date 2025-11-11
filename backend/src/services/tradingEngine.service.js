import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Trade from "../models/trade.model.js";
import Portfolio from "../models/portfolio.model.js";
import { getLatestPrice } from "./binanceFeed.service.js";

/**
 * Executes a market order instantly using the latest Redis price.
 * Handles both BUY and SELL for any symbol (e.g. BTCUSDT).
 */
export const executeMarketOrder = async (userId, symbol, side, quantity, tradeType) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const symbolUpper = symbol.toUpperCase();
    const baseAsset = symbolUpper.replace("USDT", ""); // e.g. BTC
    const quoteAsset = "USDT";

    // 1️⃣ Get current market price
    const marketData = await getLatestPrice(symbolUpper);
    if (!marketData) throw new Error("No market data available for " + symbolUpper);

    const price = parseFloat(marketData.price);
    const total = price * quantity;

    // 2️⃣ Check wallet balances
    const wallet = user.wallet;
    const quoteBalance = wallet.get(quoteAsset) || 0;
    const baseBalance = wallet.get(baseAsset) || 0;

    if (side === "BUY" && quoteBalance < total) {
      throw new Error("Insufficient " + quoteAsset + " balance");
    }
    if (side === "SELL" && baseBalance < quantity) {
      throw new Error("Insufficient " + baseAsset + " balance");
    }

    // 3️⃣ Create Order
    const order = await Order.create({
      user: user._id,
      symbol: symbolUpper,
      side,
      orderType: "MARKET",
      price,
      quantity,
      total,
      status: "FILLED",
      tradeType,
    });

    // 4️⃣ Create Trade (fill)
    const trade = await Trade.create({
      user: user._id,
      order: order._id,
      symbol: symbolUpper,
      side,
      price,
      quantity,
      total,
      tradeType,
    });

    // 5️⃣ Update wallet
    if (side === "BUY") {
      wallet.set(quoteAsset, quoteBalance - total);
      wallet.set(baseAsset, baseBalance + quantity);
    } else if (side === "SELL") {
      wallet.set(baseAsset, baseBalance - quantity);
      wallet.set(quoteAsset, quoteBalance + total);
    }
    await user.save();

    // 6️⃣ Update Portfolio
    let portfolio = await Portfolio.findOne({
      user: user._id,
      symbol: symbolUpper,
      tradeType,
    });

    if (side === "BUY") {
      if (portfolio) {
        const newQty = portfolio.quantity + quantity;
        const newAvg =
          (portfolio.quantity * portfolio.avgBuyPrice + quantity * price) / newQty;
        portfolio.quantity = newQty;
        portfolio.avgBuyPrice = newAvg;
      } else {
        portfolio = new Portfolio({
          user: user._id,
          symbol: symbolUpper,
          baseAsset,
          quoteAsset,
          quantity,
          avgBuyPrice: price,
          tradeType,
        });
      }
      await portfolio.save();
    } else if (side === "SELL") {
      if (!portfolio || portfolio.quantity < quantity) {
        throw new Error("Insufficient holdings to sell");
      }
      portfolio.quantity -= quantity;
      if (portfolio.quantity <= 0) {
        await Portfolio.deleteOne({ _id: portfolio._id });
      } else {
        await portfolio.save();
      }
    }

    return {
      message: `${side} ${quantity} ${baseAsset} @ ${price} executed successfully`,
      order,
      trade,
      updatedWallet: user.wallet,
      updatedPortfolio: portfolio,
    };
  } catch (error) {
    console.error("❌ executeMarketOrder Error:", error.message);
    throw new Error(error.message);
  }
};
