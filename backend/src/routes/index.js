import express from "express";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import orderRoute from "./order.route.js";
import walletRoute from "./wallet.route.js";
import tradeRoute from "./trade.route.js";
import marketRoute from "./market.route.js";
import portfolioRoute from "./portfolio.route.js";
import subscriptionRoute from "./subscription.route.js";

const router = express.Router();

router.use("/auth", authRoute);

router.use("/user", userRoute);
router.use("/orders", orderRoute);
router.use("/wallet", walletRoute);
router.use("/trades", tradeRoute);
router.use("/market", marketRoute);
router.use("/portfolio", portfolioRoute);
router.use("/subscription", subscriptionRoute);

export default router;
