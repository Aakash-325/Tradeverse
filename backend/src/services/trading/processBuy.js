import Trade from "../../models/trade.model.js";
import Portfolio from "../../models/portfolio.model.js";

export async function processBuy(user, symb, baseAsset, quoteAsset, quantity, price, total, tradeType) {
  const wallet = user.wallet;

  wallet.set(quoteAsset, wallet.get(quoteAsset) - total);
  wallet.set(baseAsset, (wallet.get(baseAsset) || 0) + quantity);

  // Create Trade
  const trade = await Trade.create({
    user: user._id,
    symbol: symb,
    side: "BUY",
    price,
    quantity,
    total,
    tradeType,
    realizedPnL: 0,
  });

  // Portfolio update
  let portfolio = await Portfolio.findOne({ user: user._id, symbol: symb, tradeType });
  if (portfolio) {
    const newQty = portfolio.quantity + quantity;
    portfolio.avgBuyPrice = (portfolio.quantity * portfolio.avgBuyPrice + quantity * price) / newQty;
    portfolio.quantity = newQty;
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

  return { trade, portfolio };
}
