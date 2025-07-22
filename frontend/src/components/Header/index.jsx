import { Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="w-full bg-white dark:bg-zinc-900 shadow px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
      <div className="text-xl md:text-2xl font-bold text-zinc-700 dark:text-zinc-400">
        TradeVerse
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Power className="w-5 h-5 md:w-6 md:h-6 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
    </header>
  );
};

export default Header;
