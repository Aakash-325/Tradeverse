import React, { useContext, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import socket from "@/utils/socket";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { addTradeRecord } from "@/redux/slices/tradeSlice";

const TradeTerminal = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const dispatch = useDispatch();

  const livePrice = useSelector((state) => state.trade.livePrice);
  const trades = useSelector(
    (state) => state.trade.tradeHistory || [],
    shallowEqual
  );

  useEffect(() => {
    socket.on("trade:executed", (data) => {
      dispatch(addTradeRecord(data.trade));
    });

    return () => {
      socket.off("trade:executed");
    };
  }, [dispatch]);

  return (
    <div
      className={`text-sm h-full overflow-y-auto border-t ${
        isDark ? "border-gray-700 bg-black" : "border-gray-300 bg-white"
      }`}
    >
      <p className="text-xs tracking-wide uppercase px-3 py-2 border-b border-gray-700 opacity-70">
        Executed Orders
      </p>

      {/* Header Row */}
      {trades.length > 0 && (
        <div
          className={`grid grid-cols-8 px-3 py-2 text-xs font-semibold border-b ${
            isDark ? "border-gray-700 text-gray-400" : "border-gray-300"
          }`}
        >
          <span>Symbol</span>
          <span>Entry Price</span>
          <span>Live Price</span>
          <span>Quantity</span>
          <span>Position Value</span>
          <span>Type</span> {/* Moved here */}
          <span>P/L (%)</span>
          <span className="text-center">Action</span>
        </div>
      )}

      {/* Trade Rows */}
      {trades.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No trades yet</p>
      ) : (
        trades.map((t, index) => {
          const positionValue = livePrice ? (t.quantity * livePrice).toFixed(2) : "-";
          const profitLossPercent =
            livePrice && t.price
              ? (((livePrice - t.price) / t.price) * 100).toFixed(2)
              : "-";

          return (
            <div
              key={index}
              className={`grid grid-cols-8 px-3 py-3 border-b ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <span className="font-medium">{t.symbol}</span>
              <span>{t.price}</span>
              <span className="text-blue-400">{livePrice || "-"}</span>
              <span>{t.quantity}</span>
              <span>{positionValue}</span>

              {/* Type Column */}
              <span className="font-medium">{t.side}</span>

              {/* Profit/Loss (%) */}
              <span
                className={`font-semibold ${
                  profitLossPercent !== "-" && profitLossPercent >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {profitLossPercent !== "-" ? `${profitLossPercent}%` : "-"}
              </span>

              {/* Close Button */}
              <div className="text-center">
                <button
                  className={`text-xs px-3 py-1 min-w-[70px] border 
                    ${
                      isDark
                        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white active:bg-red-700"
                        : "border-red-600 text-red-600 hover:bg-red-500 hover:text-white"
                    }
                    transition-all duration-150 cursor-pointer`}
                  onClick={() => console.log("Close order:", t._id)}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TradeTerminal;
