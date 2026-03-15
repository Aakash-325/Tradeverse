import React, { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const TickerTape = () => {
  const container = useRef(null);
  const {theme} = useContext(ThemeContext);
  const isDark = theme === "dark";

  useEffect(() => {

    if (!container.current) return;

    container.current.innerHTML = ""; 

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "BTC/USDT" },
        { proName: "BINANCE:ETHUSDT", title: "ETH/USDT" },
        { proName: "BINANCE:BNBUSDT", title: "BNB/USDT" },
        { proName: "BINANCE:SOLUSDT", title: "SOL/USDT" },
        { proName: "BINANCE:XRPUSDT", title: "XRP/USDT" },
      ],
      showSymbolLogo: true,
      colorTheme: isDark ? "dark" : "light",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en",
    });
    container.current.appendChild(script);
  }, [isDark]);

  return <div ref={container} className="w-full" />;
};

export default TickerTape;
