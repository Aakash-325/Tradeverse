import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart,
  User,
  Wallet,
  List,
  LineChart,
} from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const Sidebar = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const links = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/market", label: "Market", icon: <BarChart size={18} /> },
    { to: "/orders", label: "Orders", icon: <List size={18} /> },
    { to: "/portfolio", label: "Portfolio", icon: <Wallet size={18} /> },
    { to: "/trades", label: "Trades", icon: <LineChart size={18} /> },
    { to: "/profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <aside
      className={`w-64 h-screen border-r p-4 flex flex-col transition ${
        isDark
          ? "bg-[#0f0f0f] border-white/10 text-gray-200"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      <h1 className={`text-xl font-bold mb-8 ${isDark ? "text-white" : "text-black"}`}>
        Trading App
      </h1>

      <nav className="flex flex-col gap-2">
        {links.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-black/10 text-black"
                  : isDark
                  ? "text-gray-400 hover:bg-white/5 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
