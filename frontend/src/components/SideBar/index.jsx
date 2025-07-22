import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Eye,
  Wallet,
  ClipboardList,
  User,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Watchlist", icon: Eye, to: "/watchlist" },
  { label: "Portfolio", icon: Wallet, to: "/portfolio" },
  { label: "Orders", icon: ClipboardList, to: "/orders" },
  { label: "My Account", icon: User, to: "/myaccount" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 min-h-full bg-white dark:bg-zinc-900 border-r dark:border-gray-800 px-4 py-6">
        <nav className="space-y-2">
          {navItems.map(({ label, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === to
                  ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-white dark:bg-zinc-900 border-t dark:border-gray-800 py-2 md:hidden z-50">
        {navItems.map(({ icon: Icon, to }, index) => (
          <Link
            key={index}
            to={to}
            className={`flex flex-col items-center text-sm ${
              location.pathname === to
                ? "text-black dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
