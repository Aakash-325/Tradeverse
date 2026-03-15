import React, { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const MarketOverviewWidget = () => {
  const containerRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget before adding new one
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: isDark ? "dark" : "light",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: "100%",
      height: "500",
      tabs: [
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT" },
            { s: "BINANCE:ETHUSDT" },
            { s: "BINANCE:SOLUSDT" },
            { s: "BINANCE:XRPUSDT" },
            { s: "BINANCE:DOGEUSDT" },
          ],
        },
      ],
    });

    containerRef.current.appendChild(script);
  }, [isDark]); // 👈 Re-render when theme changes

  return <div ref={containerRef} className="w-full h-[500px]" />;
};

export default MarketOverviewWidget;
