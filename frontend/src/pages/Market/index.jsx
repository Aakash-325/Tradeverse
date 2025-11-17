import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Search } from "lucide-react";
import socket from "@/utils/socket";

const Market = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [tickers, setTickers] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (updates) => {
      const formatted = Object.fromEntries(
        updates.map((t) => [t.symbol, t])
      );
      setTickers((prev) => ({ ...prev, ...formatted }));
    };

    socket.on("marketData", handler);
    return () => socket.off("marketData", handler);
  }, []);

  const filtered = Object.values(tickers).filter((item) =>
    item.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`p-6 ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Market</h1>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-64 ${
            isDark ? "bg-white/5" : "bg-gray-200"
          }`}
        >
          <Search size={18} className="opacity-60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className={`bg-transparent outline-none w-full ${
              isDark ? "text-white" : "text-black"
            }`}
          />
        </div>
      </div>

      {/* TABLE HEADER */}
      <div
        className={`grid grid-cols-5 px-4 py-2 text-sm font-semibold border-b ${
          isDark
            ? "text-gray-400 border-white/10"
            : "text-gray-700 border-gray-300"
        }`}
      >
        <span>Pair</span>
        <span>Price</span>
        <span>Change</span>
        <span>Volume</span>
        <span>Action</span>
      </div>

      {/* ROWS */}
      <div className="mt-2">
        {filtered.map((item) => (
          <div
            key={item.symbol}
            className={`grid grid-cols-5 px-4 py-4 rounded-lg mb-2 cursor-pointer 
              border transition-all
              ${
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
          >
            {/* Pair */}
            <div className="font-medium tracking-wide">{item.symbol}</div>

            {/* Price */}
            <div className="font-semibold">{item.price.toFixed(4)}</div>

            {/* Change */}
            <div
              className={`font-semibold ${
                item.change > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {item.change}%
            </div>

            {/* Volume */}
            <div className="opacity-80">{item.volume.toLocaleString()}</div>

            {/* View Button */}
            <button
              onClick={() => console.log("Open chart:", item.symbol)}
              className={`px-3 py-1 rounded-md text-sm 
                ${
                  isDark
                    ? "bg-white/10 border border-white/10 hover:bg-white/20"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
            >
              View
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center opacity-60 mt-6">No matches found.</p>
        )}
      </div>
    </div>
  );
};

export default Market;
