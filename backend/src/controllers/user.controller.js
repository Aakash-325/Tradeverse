import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "email username totalRealizedPnL createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("❌ getUserProfile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};
