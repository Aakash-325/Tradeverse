import React, { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const MiniChart = ({ symbol = "BINANCE:BTCUSDT", height = 400 }) => {
  const container = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = ""; // Reset widget

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height,
      locale: "en",
      dateRange: "1M",
      colorTheme: isDark ? "dark" : "light",
      isTransparent: false,
      chartType: "area",
    });

    container.current.appendChild(script);
  }, [symbol, height, isDark]); // 🔥 Theme now updates automatically

  return <div ref={container} className="w-full" />;
};

export default MiniChart;
