import { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "@/context/ThemeContext";
import { createChart } from "lightweight-charts";
import axios from "axios";
import API_CONFIG from "@/Config";
import socket from "@/utils/socket";
import { useDispatch } from "react-redux";
import { setLivePrice } from "@/redux/slices/tradeSlice";
import api from "@/utils/api";

const Chart = () => {
  const { symbol } = useParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const dispatch = useDispatch();

  const chartContainerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [interval, setInterval] = useState("1m");
  const [lastPriceData, setLastPriceData] = useState({ price: "-", change: "-" });

  const intervalOptions = ["1m", "5m", "15m", "1h", "4h", "1d"];

  useEffect(() => {
    if (!symbol || !chartContainerRef.current) return;

    socket.emit("subscribeToSymbol", symbol);

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: isDark ? "#000" : "#fff" },
        textColor: isDark ? "#D1D4DC" : "#000",
      },
      grid: {
        vertLines: { color: isDark ? "#1E1E1E" : "#e0e0e0" },
        horzLines: { color: isDark ? "#1E1E1E" : "#e0e0e0" },
      },
      rightPriceScale: { borderColor: "#555" },
      timeScale: { borderColor: "#555", timeVisible: true, secondsVisible: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00C176",
      downColor: "#FF4976",
      borderUpColor: "#00C176",
      borderDownColor: "#FF4976",
      wickUpColor: "#00C176",
      wickDownColor: "#FF4976",
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
      scaleMargins: { top: 0.75, bottom: 0 },
      upColor: "#00C176",
      downColor: "#FF4976",
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const fetchInitialData = async () => {
      try {
        const res = await api.get(
          `${API_CONFIG.MARKET.Kline}?symbol=${symbol}&interval=${interval}`
        );
        console.log("Numbe of candles:",res.data?.candles?.length);
        if (res.data?.candles?.length) {
          const formatted = res.data.candles.map((c) => ({
            time: Math.floor(c.time / 1000),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));

          candleSeries.setData(formatted);

          volumeSeries.setData(
            res.data.candles.map((c) => ({
              time: Math.floor(c.time / 1000),
              value: c.volume,
              color: c.close > c.open ? "#00C176" : "#FF4976",
            }))
          );

          const last = formatted[formatted.length - 1];
          setLastPriceData({
            price: last.close,
            change: (((last.close - last.open) / last.open) * 100).toFixed(2),
          });

          chart.timeScale().scrollToRealTime();
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    fetchInitialData();

    const socketEvent = `kline-${symbol}-${interval}`;
    socket.on(socketEvent, (update) => {
      if (!update) return;

      dispatch(setLivePrice(update.close));

      candleSeries.update({
        time: Math.floor(update.time / 1000),
        open: update.open,
        high: update.high,
        low: update.low,
        close: update.close,
      });

      volumeSeries.update({
        time: Math.floor(update.time / 1000),
        value: update.volume,
        color: update.close > update.open ? "#00C176" : "#FF4976",
      });


      setLastPriceData({
        price: update.close,
        change: (((update.close - update.open) / update.open) * 100).toFixed(2),
      });

      chart.timeScale().scrollToRealTime();
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      socket.emit("unsubscribeFromSymbol", symbol);
      socket.off(socketEvent);
      window.removeEventListener("resize", handleResize);
      chart.remove();
      dispatch(setLivePrice(null));
    };
  }, [symbol, interval, isDark]);

  return (
    <div className="w-full h-full relative ">
      <div
        className={`absolute top-2 left-3 z-20 flex items-center gap-4 text-xs px-2 py-1 rounded 
          ${isDark ? "bg-black/40 text-gray-200 " : "bg-white/50 text-gray-700"}`}
      >
        <span className="font-semibold">{symbol}</span>
        <span
          className={`px-2 py-1 rounded ${
            lastPriceData.change > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {lastPriceData.price} ({lastPriceData.change}%)
        </span>

        <div className="flex gap-1">
          {intervalOptions.map((i) => (
            <button
              key={i}
              className={`px-2 py-0.5 rounded ${
                i === interval
                  ? "bg-blue-500 text-white"
                  : isDark
                  ? "bg-white/10 text-gray-300 hover:bg-white/20"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setInterval(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: "200px" }} />
    </div>
  );
};

export default Chart;
