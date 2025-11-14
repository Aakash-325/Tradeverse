import User from "../models/user.model.js";

export const getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wallet = Object.fromEntries(user.wallet || []);

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error(" getWallet Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
