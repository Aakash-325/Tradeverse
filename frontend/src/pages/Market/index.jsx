import { useEffect, useState, useContext, useRef } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Search, Star, BarChart2 } from "lucide-react";
import socket from "@/utils/socket";
import { useVirtualizer } from "@tanstack/react-virtual";

const ROW_HEIGHT = 70; // set actual height with padding

const Market = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [tickers, setTickers] = useState({});
  const [search, setSearch] = useState("");

  const parentRef = useRef(null);

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

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div className={`p-6 ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Market</h1>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg w-64 ${isDark ? "bg-white/5" : "bg-gray-200"
            }`}
        >
          <Search size={18} className="opacity-60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className={`bg-transparent outline-none w-full ${isDark ? "text-white" : "text-black"
              }`}
          />
        </div>
      </div>

      {/* TABLE HEADER */}
      <div
        className={`grid grid-cols-[1.5fr,1fr,1fr,1fr,1.2fr] px-4 py-2 text-sm font-semibold border-b ${isDark ? "text-gray-400 border-white/10" : "text-gray-700 border-gray-300"
          }`}
      >
        <span>Pair</span>
        <span>Price</span>
        <span>Change</span>
        <span>Volume</span>
        <span className="text-center">Action</span>
      </div>


      {/* VIRTUALIZED LIST */}
      <div
        ref={parentRef}
        className="mt-2 overflow-y-auto scrollbar-none"
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
            width: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = filtered[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* ROW */}
                <div
                  className={`grid grid-cols-[1.5fr,1fr,1fr,1fr,1.2fr] px-4 py-3 my-2 rounded-lg cursor-pointer border transition
    ${isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:bg-gray-100"
                    }`}
                  style={{ height: ROW_HEIGHT - 16 }}
                >

                  <div className="font-medium">{item.symbol}</div>
                  <div>{item.price.toFixed(4)}</div>
                  <div
                    className={`font-semibold ${item.change > 0 ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    {item.change}%
                  </div>
                  <div className="opacity-80">
                    {item.volume.toLocaleString()}
                  </div>
                  <div
                    className="flex items-center gap-3 justify-center"
                  >
                    {/* Watchlist Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Watchlist toggled:", item.symbol);
                      }}
                      className={`p-2 rounded-md transition ${isDark
                        ? "hover:bg-white/10 text-yellow-400"
                        : "hover:bg-gray-200 text-yellow-500"
                        }`}
                      title="Add to Watchlist"
                    >
                      <Star size={18} />
                    </button>

                    {/* View Chart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Open chart:", item.symbol);
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${isDark
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-black text-white hover:bg-gray-800"
                        }`}
                      title="View Chart"
                    >
                      <BarChart2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center opacity-60 mt-6">No Data found.</p>
      )}
    </div>
  );
};

export default Market;
