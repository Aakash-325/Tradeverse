import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

import SummaryCards from "@/components/DashBoard/SummaryCards";
import TickerTape from "@/components/DashBoard/TickerTape";
import MarketOverviewWidget from "@/components/DashBoard/MarketOverviewWidget";
import MiniChart from "@/components/DashBoard/MiniChart";
import NewsWidget from "@/components/DashBoard/NewsWidget";
import HeatmapWidget from "@/components/DashBoard/HeatmapWidget";

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={`p-6 min-h-screen ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* Live Ticker */}
      <TickerTape />

      {/* Summary Cards */}
      <div className="mt-6">
        <SummaryCards />
      </div>

      {/* Market Overview & Mini Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div
            className={`rounded-xl shadow-lg border ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200"
            } p-5`}
          >
            <MarketOverviewWidget />
          </div>
        </div>

        <div
  className={`rounded-xl shadow-lg border ${
    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
  } p-5`}
  style={{ height: "542px" }}   // 🔥 Set wrapper height
>
  <MiniChart symbol="BINANCE:BTCUSDT" height={500} />
</div>

      </div>

      {/* Heatmap */}
      <div
        className={`rounded-xl shadow-lg border mt-6 ${
          isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
        } p-5`}
      >
        <HeatmapWidget />
      </div>

      {/* News Section */}
      <div
        className={`rounded-xl shadow-lg border mt-6 ${
          isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
        } p-5`}
      >
        <NewsWidget />
      </div>
    </div>
  );
};

export default Dashboard;
