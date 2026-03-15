import React, { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const HeatmapWidget = () => {
  const containerRef = useRef(null);
  const { theme } = useContext(ThemeContext);   // ✔ Fix: properly get theme
  const isDark = theme === "dark";

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = ""; // Clear old widget

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 500,
      currencies: [
        "USD",
        "EUR",
        "JPY",
        "GBP",
        "AUD",
        "CAD",
        "CHF",
        "NZD"
      ],
      colorTheme: isDark ? "dark" : "light", 
      isTransparent: false,
      locale: "en",
    });

    containerRef.current.appendChild(script);
  }, [isDark]);  // 🔥 Re-render when theme changes

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default HeatmapWidget;
