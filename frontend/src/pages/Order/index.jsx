import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

// Dummy sample orders
const sampleOrders = [
  {
    id: "1",
    symbol: "BTCUSDT",
    type: "Buy",
    quantity: 0.1,
    price: 29000,
    timestamp: "2025-07-18T11:30:00Z",
  },
  {
    id: "2",
    symbol: "ETHUSDT",
    type: "Sell",
    quantity: 0.5,
    price: 1850,
    timestamp: "2025-07-18T12:00:00Z",
  },
  {
    id: "3",
    symbol: "SOLUSDT",
    type: "Buy",
    quantity: 10,
    price: 25.5,
    timestamp: "2025-07-17T15:45:00Z",
  },
];

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate API call
    setOrders(sampleOrders);
  }, []);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-muted/50 dark:bg-background">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        🧾 Order History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20">
          No orders placed yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{order.symbol}</h3>
                  <Badge
                    className={`text-white ${
                      order.type === "Buy" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {order.type}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  Quantity: <span className="font-medium">{order.quantity}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Price: <span className="font-medium">${order.price}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatDate(order.timestamp)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
