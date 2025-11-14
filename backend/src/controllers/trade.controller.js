import Trade from "../models/trade.model.js";

export const getTrades = async (req, res) => {
  try {
    const userId = req.user.userId;

    const trades = await Trade.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      trades,
    });
  } catch (error) {
    console.error("❌ getTrades Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
