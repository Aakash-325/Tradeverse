import { useEffect, useState } from "react";
import { Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([
    { symbol: "BTCUSDT", name: "Bitcoin", price: 0, change: 0 },
    { symbol: "ETHUSDT", name: "Ethereum", price: 0, change: 0 },
  ]);

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const updates = {};

      data.forEach((item) => {
        updates[item.s] = {
          price: parseFloat(item.c),
          change: parseFloat(item.P),
        };
      });

      setWatchlist((prev) =>
        prev.map((coin) =>
          updates[coin.symbol]
            ? {
                ...coin,
                price: updates[coin.symbol].price,
                change: updates[coin.symbol].change,
              }
            : coin
        )
      );
    };

    return () => ws.close();
  }, []);

  const removeFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((coin) => coin.symbol !== symbol));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6">📈 Your Watchlist</h2>

      {watchlist.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">No assets in your watchlist.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {watchlist.map((coin) => (
            <Card key={coin.symbol} className="bg-white dark:bg-zinc-800 hover:shadow-lg transition">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">{coin.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromWatchlist(coin.symbol)}
                    className="hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>

                <div className="text-sm text-zinc-500">{coin.symbol}</div>

                <div className="flex justify-between items-end">
                  <div className="text-xl font-bold text-zinc-900 dark:text-white">
                    ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      coin.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {coin.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {coin.change.toFixed(2)}%
                  </div>
                </div>

                <Button variant="link" className="mt-2 text-violet-600 text-sm px-0">
                  View Chart →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
