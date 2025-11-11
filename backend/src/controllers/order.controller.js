import { executeMarketOrder } from "../services/tradingEngine.service.js";

/**
 * POST /orders/market
 * Executes a market BUY or SELL order instantly
 */
export const placeMarketOrder = async (req, res) => {
  try {
    const { symbol, side, quantity, tradeType } = req.body;

    // ✅ Basic validation
    if (!symbol || !side || !quantity || !tradeType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["BUY", "SELL"].includes(side.toUpperCase())) {
      return res.status(400).json({ message: "Invalid order side" });
    }

    // ✅ Execute order via trading engine
    const result = await executeMarketOrder(
      req.user.userId, // user from auth middleware
      symbol,
      side.toUpperCase(),
      parseFloat(quantity),
      tradeType
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("❌ placeMarketOrder Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
