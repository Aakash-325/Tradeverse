import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Banknote, FileText, LineChart, BarChart3 } from "lucide-react";

const MyAccount = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      {/* Top Section */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-zinc-700 flex items-center justify-center text-xl font-semibold text-violet-700">
              AC
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-white">Akash Ramesh Chaurasiya</h2>
              <p className="text-sm text-violet-500 font-medium">View Profile</p>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-4 md:mt-0">👤 Member since 2022</p>
        </div>

        {/* Balance Section */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p className="text-sm text-zinc-500">Trading Balance</p>
            <p className="text-xl font-semibold text-zinc-800 dark:text-white">₹ 0.00</p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Wallet size={16} /> Withdraw Funds
            </Button>
            <Button className="flex items-center gap-2 bg-violet-600 text-white hover:bg-violet-700">
              <Banknote size={16} /> Add Funds
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Button variant="link" className="text-sm text-violet-600">
            View Transaction Summary →
          </Button>
        </div>
      </div>

      {/* Reports Section */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card icon={<FileText />} title="Trades & Charges" />
        <Card icon={<FileText />} title="Statements" />
        <Card icon={<LineChart />} title="Profit & Loss" />
        <Card icon={<BarChart3 />} title="Trading Insights" badge="NEW" />
      </div>

      {/* Pay Later Section */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <InfoCard
          title="Stock Pledging"
          description="Increase your trading balance by pledging your Portfolio Stocks"
          bg="bg-blue-50"
        />
        <InfoCard
          title="MTF"
          description="Buy up to 4x equity with just 0.041% interest/day"
          bg="bg-purple-100"
        />
        <InfoCard
          title="Transfer Stocks"
          description="Transferring stocks to any Demat account securely"
          bg="bg-green-50"
        />
      </div>

      {/* Quick Settings */}
      <div className="text-sm text-right">
        <Button variant="link" className="text-violet-600">View All →</Button>
      </div>
    </div>
  );
};

const Card = ({ icon, title, badge }) => (
  <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-violet-100 dark:bg-zinc-700 text-violet-600">{icon}</div>
      <p className="text-zinc-800 dark:text-white font-medium">{title}</p>
    </div>
    {badge && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{badge}</span>}
  </div>
);

const InfoCard = ({ title, description, bg }) => (
  <div className={`p-4 rounded-lg ${bg} dark:bg-zinc-700`}>
    <h4 className="font-semibold text-zinc-800 dark:text-white">{title}</h4>
    <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
  </div>
);

export default MyAccount;
