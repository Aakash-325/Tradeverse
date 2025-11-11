import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    orderType: { type: String, enum: ["MARKET", "LIMIT"], default: "MARKET" },
    price: { type: Number }, // limit price
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "FILLED", "CANCELLED"], default: "FILLED" },
    tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
