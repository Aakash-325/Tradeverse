import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol:  { type: String, required: true },
  side:    { type: String, enum: ["BUY", "SELL"], required: true },
  price:   { type: Number, required: true },
  quantity:{ type: Number, required: true },
  tradeType: { type: String, enum: ["INTRADAY", "LONG_TERM"], required: true },
  orderStatus:  { type: String, enum: ["PENDING", "FILLED", "CANCELLED"], default: "PENDING" },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;

