import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { TrendingUp, TrendingDown, Wallet, BarChart } from "lucide-react";

const SummaryCards = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";


  const data = [
    {
      title: "Portfolio Value",
      value: "$14,862.80",
      change: "+3.45%",
      icon: <Wallet size={28} />,
      positive: true,
    },
    {
      title: "Total Invested",
      value: "$12,450.00",
      change: "+1.12%",
      icon: <BarChart size={28} />,
      positive: true,
    },
    {
      title: "Available Balance",
      value: "$2,412.80",
      change: null,
      icon: <Wallet size={28} />,
      positive: true,
    },
    {
      title: "Today's P/L",
      value: "-$183.20",
      change: "-1.22%",
      icon: <TrendingDown size={28} />,
      positive: false,
    },
  ];

  const cardBaseStyle = `rounded-xl p-5 border shadow-md transition-all duration-300 
  ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"}
  hover:shadow-lg hover:scale-[1.02]`;


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((card, index) => (
        <div key={index} className={cardBaseStyle}>
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-70">{card.title}</p>
            <div className="opacity-80">{card.icon}</div>
          </div>

          <p className="text-2xl font-semibold mt-2">{card.value}</p>

          {card.change && (
            <p
              className={`text-sm mt-1 ${card.positive ? "text-green-400" : "text-red-500"
                }`}
            >
              {card.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
