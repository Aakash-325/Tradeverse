import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol:   { type: String, required: true },
  side:     { type: String, enum: ["BUY", "SELL"], required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
  tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  total:    { type: Number, required: true },
}, { timestamps: true });

const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;