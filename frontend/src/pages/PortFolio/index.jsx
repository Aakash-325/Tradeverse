import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const initialPortfolio = [
  {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    quantity: 0.25,
    avgBuyPrice: 30000,
    currentPrice: 0,
  },
  {
    symbol: "ETHUSDT",
    name: "Ethereum",
    quantity: 1.5,
    avgBuyPrice: 1800,
    currentPrice: 0,
  },
];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!miniTicker@arr");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const updates = {};

      data.forEach((item) => {
        updates[item.s] = parseFloat(item.c);
      });

      setPortfolio((prev) =>
        prev.map((asset) =>
          updates[asset.symbol]
            ? { ...asset, currentPrice: updates[asset.symbol] }
            : asset
        )
      );
    };

    return () => ws.close();
  }, []);

  const totalValue = portfolio.reduce(
    (sum, asset) => sum + asset.quantity * asset.currentPrice,
    0
  );

  const totalInvestment = portfolio.reduce(
    (sum, asset) => sum + asset.quantity * asset.avgBuyPrice,
    0
  );

  const totalPnL = totalValue - totalInvestment;
  const pnlColor = totalPnL >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-4">
        💼 Your Portfolio
      </h2>

      <Card className="mb-6 bg-white dark:bg-zinc-800">
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="text-lg font-medium text-zinc-600 dark:text-zinc-300">Total Value</div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${pnlColor}`}>
            P&L: {totalPnL >= 0 ? "+" : "-"}${Math.abs(totalPnL).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {portfolio.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">No assets in your portfolio.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.map((asset) => {
            const value = asset.currentPrice * asset.quantity;
            const investment = asset.avgBuyPrice * asset.quantity;
            const pnl = value - investment;
            const isPositive = pnl >= 0;

            return (
              <Card key={asset.symbol} className="bg-white dark:bg-zinc-800 hover:shadow-md">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                      {asset.name}
                    </h3>
                    <div className="text-sm text-zinc-500">{asset.symbol}</div>
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Quantity: {asset.quantity}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Avg Buy Price: ${asset.avgBuyPrice}
                  </div>

                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Current Price: ${asset.currentPrice.toFixed(2)}
                  </div>

                  <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    Value: ${value.toFixed(2)}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    P&L: {isPositive ? "+" : "-"}${Math.abs(pnl).toFixed(2)}
                  </div>

                  <Button variant="link" className="mt-2 text-violet-600 text-sm px-0">
                    Trade →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
