
import Trade from "../../models/trade.model.js";
import Portfolio from "../../models/portfolio.model.js";

export async function processSell(user, symb, baseAsset, quoteAsset, quantity, price, total, tradeType, io) {
  const wallet = user.wallet;

  wallet.set(baseAsset, wallet.get(baseAsset) - quantity);
  wallet.set(quoteAsset, wallet.get(quoteAsset) + total);

  // Fetch portfolio
  let portfolio = await Portfolio.findOne({ user: user._id, symbol: symb, tradeType });
  if (!portfolio || portfolio.quantity < quantity)
    throw new Error("Insufficient holdings");

  const avgBuy = portfolio.avgBuyPrice;
  const realizedPnL = (price - avgBuy) * quantity;

  // Update portfolio quantity
  portfolio.quantity -= quantity;

  let portfolioClosed = false;

  if (portfolio.quantity <= 0) {
    await Portfolio.deleteOne({ _id: portfolio._id });
    portfolioClosed = true;
  } else {
    await portfolio.save();
  }

  // Create trade
  const trade = await Trade.create({
    user: user._id,
    symbol: symb,
    side: "SELL",
    price,
    quantity,
    total,
    tradeType,
    realizedPnL,
  });

  // Update lifetime PnL
  user.totalRealizedPnL = (user.totalRealizedPnL || 0) + realizedPnL;

  return { trade, realizedPnL, portfolio, portfolioClosed };
}
