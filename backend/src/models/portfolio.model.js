import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol:   { type: String, required: true },
  quantity: { type: Number, required: true },
  tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  avgBuyPrice: { type: Number, required: true },
}, { timestamps: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;