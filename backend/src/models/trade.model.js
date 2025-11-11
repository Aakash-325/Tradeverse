import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    symbol: { type: String, required: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    price: { type: Number, required: true }, // execution price
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Trade", tradeSchema);
