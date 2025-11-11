import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dummy currency list (Replace with real data from /api/symbols)
const dummySymbols = [
  { symbol: "BTCUSDT", base: "BTC", quote: "USDT", active: true },
  { symbol: "ETHUSDT", base: "ETH", quote: "USDT", active: true },
  { symbol: "SOLUSDT", base: "SOL", quote: "USDT", active: true },
  { symbol: "BNBUSDT", base: "BNB", quote: "USDT", active: true },
  { symbol: "DOGEUSDT", base: "DOGE", quote: "USDT", active: true },
  { symbol: "XRPUSDT", base: "XRP", quote: "USDT", active: true },
];

const Dashboard = () => {
  const [symbols, setSymbols] = useState([]);

  useEffect(() => {
    // TODO: Replace this with actual API call
    setSymbols(dummySymbols);
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-6">
        📊 Market Dashboard
      </h2>

      {symbols.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">No symbols available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols.map((item) => (
            <Card key={item.symbol} className="bg-white dark:bg-zinc-800 hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                    {item.symbol}
                  </h3>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Base Asset: <span className="font-medium">{item.base}</span>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Quote Asset: <span className="font-medium">{item.quote}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
