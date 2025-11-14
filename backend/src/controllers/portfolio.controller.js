import Portfolio from "../models/portfolio.model.js";
import { getLatestPrice } from "../services/binanceFeed.service.js";

export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.userId;

    const portfolios = await Portfolio.find({ user: userId });

    const enriched = [];

    for (const asset of portfolios) {
      const market = await getLatestPrice(asset.symbol);
      const currentPrice = market ? parseFloat(market.price) : 0;

      const unrealizedPnL =
        (currentPrice - asset.avgBuyPrice) * asset.quantity;

      enriched.push({
        symbol: asset.symbol,
        quantity: asset.quantity,
        avgBuyPrice: asset.avgBuyPrice,
        currentPrice,
        unrealizedPnL,
        tradeType: asset.tradeType,
      });
    }

    return res.status(200).json({
      success: true,
      portfolio: enriched,
    });
  } catch (error) {
    console.error("❌ getPortfolio Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
