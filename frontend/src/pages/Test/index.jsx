import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function ChartDemo() {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: { background: { color: "#0b0f14" }, textColor: "#d1d4dc" },
      grid: {
        vertLines: { color: "#1f2533" },
        horzLines: { color: "#1f2533" },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candleSeriesRef.current = candleSeries;

    // Static starting candles
    const initialData = [
      { time: "2024-11-01", open: 62000, high: 62500, low: 61500, close: 62200 },
      { time: "2024-11-02", open: 62200, high: 63000, low: 62000, close: 62850 },
      { time: "2024-11-03", open: 62850, high: 63500, low: 62200, close: 63000 },
      { time: "2024-11-04", open: 63000, high: 64000, low: 62900, close: 63800 },
      { time: "2024-11-05", open: 63800, high: 64500, low: 63500, close: 64000 },
    ];

    candleSeries.setData(initialData);

    // Function to simulate live movement
    let lastCandle = initialData[initialData.length - 1];

    const interval = setInterval(() => {
      const newClose = lastCandle.close + (Math.random() - 0.5) * 500;
      const newHigh = Math.max(lastCandle.high, newClose + Math.random() * 200);
      const newLow = Math.min(lastCandle.low, newClose - Math.random() * 200);

      lastCandle = {
        ...lastCandle,
        close: Math.round(newClose),
        high: Math.round(newHigh),
        low: Math.round(newLow),
      };

      candleSeriesRef.current.update(lastCandle);
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-[#111418] p-4 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white text-center">
          Live Moving Candlestick Chart (Demo)
        </h2>
        <div ref={chartRef} className="w-full" />
      </div>
    </div>
  );
}
