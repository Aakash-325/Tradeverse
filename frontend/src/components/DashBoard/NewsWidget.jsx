import React, { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const NewsWidget = () => {
  const container = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = ""; // Clear previous widget to prevent duplicates

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "all_symbols",
      colorTheme: isDark ? "dark" : "light",
      isTransparent: false,
      displayMode: "compact",
      width: "100%",
      height: "600",
      locale: "en",
    });

    container.current.appendChild(script);
  }, [isDark]); // 🔥 Rebuild widget when theme changes

  return <div ref={container} className="w-full" />;
};

export default NewsWidget;
