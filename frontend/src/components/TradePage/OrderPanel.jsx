import React, { useContext, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";
import API_CONFIG from "@/Config";
import api from "@/utils/api";

const OrderPanel = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const livePrice = useSelector((state) => state.trade.livePrice);
  const token = useSelector((state) => state.auth.token);
  const { symbol } = useParams();
  const [quantity, setQuantity] = useState("");

  const estimatedCost =
    livePrice && quantity ? (livePrice * quantity).toFixed(2) : "-";

  const handleOrder = async (side) => {
    if (!quantity || quantity <= 0) return showError("Enter a valid quantity");
    if (!livePrice) return showError("Live price not available");

    const orderData = {
      symbol,
      quantity: parseFloat(quantity),
      price: livePrice,
      side,
      tradeType: "INTRADAY",
    };

    try {
      const res = await api.post(API_CONFIG.ORDERS.PlaceOrder, orderData);

      if (res.status === 200 || res.status === 201) {
        showSuccess("Successfully placed order!");
        setQuantity(""); // Reset field
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div
      className={`flex flex-col h-full p-4 text-sm border ${isDark
          ? "bg-black text-gray-200 border-[#1f1f1f]"
          : "bg-white text-gray-800 border-gray-200"
        }`}
    >
      <div className="flex justify-between mb-4">
        <p className="font-semibold">{symbol}</p>
        <p className="text-green-400 font-medium">{livePrice || "-"}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs opacity-70">Order Type</p>
        <p className="mt-1 font-semibold">Market</p>
      </div>

      <div className="mb-4">
        <label className="text-xs opacity-70">Quantity (BTC)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={`w-full mt-1 bg-transparent outline-none text-sm py-1 ${isDark
              ? "text-gray-200 border-b border-gray-700"
              : "text-gray-800 border-b border-gray-300"
            }`}
        />
      </div>

      <div className="mb-4">
        <p className="text-xs opacity-70">Estimated Cost</p>
        <p className="mt-1 font-medium">{estimatedCost} USDT</p>
      </div>

      <div className="mb-6 text-xs opacity-70">
        Available Balance: <span className="font-medium">10000 USDT</span>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 py-2 bg-green-500 hover:bg-green-600 font-semibold"
          onClick={() => handleOrder("BUY")}
        >
          Buy
        </button>
        <button
          className="flex-1 py-2 bg-red-500 hover:bg-red-600 font-semibold"
          onClick={() => handleOrder("SELL")}
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default OrderPanel;
