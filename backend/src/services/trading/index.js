import { validateAndFetch } from "./validateAndFetch.js";
import { processBuy } from "./processBuy.js";
import { processSell } from "./processSell.js";
import { emitTradeEvents } from "./emitTradeEvents.js";
import Order from "../../models/order.model.js";
import { getIO } from "../socket.service.js";

export const executeMarketOrder = async (userId, symbol, side, quantity, tradeType) => {
  try {
    const { user, symb, baseAsset, quoteAsset, price, total } =
      await validateAndFetch(userId, symbol, side, quantity);
      const io = getIO();

    // Validate wallet
    const quoteBalance = user.wallet.get(quoteAsset) || 0;
    const baseBalance = user.wallet.get(baseAsset) || 0;

    if (side === "BUY" && quoteBalance < total)
      throw new Error("Insufficient balance");

    if (side === "SELL" && baseBalance < quantity)
      throw new Error("Insufficient holdings");

    // Create Order
    const order = await Order.create({
      user: user._id,
      symbol: symb,
      side,
      price,
      quantity,
      total,
      orderType: "MARKET",
      status: "FILLED",
      tradeType,
    });

    let trade, portfolio, realizedPnL = 0, portfolioClosed = false;

    if (side === "BUY") {
      const result = await processBuy(user, symb, baseAsset, quoteAsset, quantity, price, total, tradeType);
      trade = result.trade;
      portfolio = result.portfolio;
    }

    if (side === "SELL") {
      const result = await processSell(user, symb, baseAsset, quoteAsset, quantity, price, total, tradeType);
      trade = result.trade;
      realizedPnL = result.realizedPnL;
      portfolio = result.portfolio;
      portfolioClosed = result.portfolioClosed;
    }

    await user.save();

    emitTradeEvents(io, userId, order, trade, portfolio, portfolioClosed, realizedPnL);

    return {
      message: "Order executed",
      order,
      trade,
      realizedPnL,
      wallet: user.wallet,
    };
  } catch (error) {
    console.error("executeMarketOrder Error:", error.message);
    throw new Error(error.message);
  }
};
