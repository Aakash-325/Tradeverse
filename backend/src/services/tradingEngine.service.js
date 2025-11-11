// services/tradingEngine.service.js
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
    // 0️⃣ Basic sanity checks
    if (!symbol || !side || !quantity || quantity <= 0) {
      throw new Error("Invalid order parameters");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const symb = symbol.toUpperCase();
    const baseAsset = symb.replace("USDT", ""); // e.g. BTC
    const quoteAsset = "USDT";

    // 1️⃣ Get current market price
    const marketData = await getLatestPrice(symb); 
    if (!marketData) throw new Error("No market data available for " + symb);

    // Optional: prevent stale price usage (> 10 seconds old)
    if (Date.now() - marketData.ts > 10000) {
      throw new Error("Stale market data, please retry");
    }

    const price = parseFloat(marketData.price);
    const total = price * quantity;

    // 2️⃣ Check wallet balances
    const wallet = user.wallet;
    const quoteBalance = wallet.get(quoteAsset) || 0;
    const baseBalance = wallet.get(baseAsset) || 0;

    if (side === "BUY" && quoteBalance < total) {
      throw new Error(`Insufficient ${quoteAsset} balance`);
    }
    if (side === "SELL" && baseBalance < quantity) {
      throw new Error(`Insufficient ${baseAsset} balance`);
    }

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

    // 4️⃣ Execute the trade
    let trade;
    let realizedPnL = 0;

    // 5️⃣ Update wallet balances
    if (side === "BUY") {
      wallet.set(quoteAsset, quoteBalance - total);
      wallet.set(baseAsset, baseBalance + quantity);

      // 🟢 Create BUY trade (realizedPnL = 0)
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
    } 
    else if (side === "SELL") {
      wallet.set(baseAsset, baseBalance - quantity);
      wallet.set(quoteAsset, quoteBalance + total);

      // 6️⃣ Update Portfolio & Calculate Realized PnL
      let portfolio = await Portfolio.findOne({
        user: user._id,
        symbol: symb,
        tradeType,
      });

      if (!portfolio || portfolio.quantity < quantity) {
        throw new Error("Insufficient holdings to sell");
      }

      const avgBuy = portfolio.avgBuyPrice;
      realizedPnL = (price - avgBuy) * quantity; // + = profit, - = loss

      portfolio.quantity -= quantity;
      if (portfolio.quantity <= 0) {
        await Portfolio.deleteOne({ _id: portfolio._id });
      } else {
        await portfolio.save();
      }

      // 🧾 Create SELL trade (record realizedPnL)
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

      // 🧮 Update user's lifetime realized profit
      user.totalRealizedPnL = (user.totalRealizedPnL || 0) + realizedPnL;
    }

    // 7️⃣ Save updated wallet
    await user.save();

    // 8️⃣ Update Portfolio (BUY side)
    if (side === "BUY") {
      let portfolio = await Portfolio.findOne({
        user: user._id,
        symbol: symb,
        tradeType,
      });

      if (portfolio) {
        const newQty = portfolio.quantity + quantity;
        const newAvg =
          (portfolio.quantity * portfolio.avgBuyPrice + quantity * price) / newQty;
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
    }

    // 9️⃣ Return summary
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
