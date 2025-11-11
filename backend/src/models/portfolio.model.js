import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true }, // e.g. BTCUSDT
    baseAsset: { type: String, required: true }, // e.g. BTC
    quoteAsset: { type: String, required: true }, // e.g. USDT
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
    tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Portfolio", portfolioSchema);
