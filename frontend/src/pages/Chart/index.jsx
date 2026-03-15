// src/pages/Trade/index.jsx
import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import Chart from "@/components/TradePage/Chart";
import OrderPanel from "@/components/TradePage/OrderPanel";
import TradeTerminal from "@/components/TradePage/TradeTerminal";

const ChartPage = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const wrapperStyle = `p-6 min-h-screen flex flex-col gap-4 ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"
    }`;

  const cardStyle = `rounded-xl shadow-lg transition border ${isDark
    ? "bg-white/5 border-white/10 hover:bg-white/10"
    : "bg-white border-gray-200 hover:bg-gray-100"
    }`;

  return (
    <div
      className={`flex flex-col w-full h-[calc(100vh-70px)] ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"
        }`}
    >
      <div className="flex flex-1 gap-2">

        <div className={`flex-[3] p-1`}>
          <div
            className={`w-full h-full ${isDark ? "bg-black" : "bg-white border"
              }`}
          >
            <Chart />
          </div>
        </div>

        <div className="flex-[1.1] flex flex-col gap-2">
          <div className={`flex-1 ${isDark ? "bg-black" : "bg-white border"}`}>
            <OrderPanel />
          </div>
        </div>
      </div>

      <div
        className={`h-[35vh] mt-2 ${isDark ? "bg-black" : "bg-white border"
          }`}
      >
        <TradeTerminal />
      </div>
    </div>


  );
};

export default ChartPage;
