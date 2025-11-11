import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-14 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center px-1 cursor-pointer transition-colors duration-300"
    >
      <div
        className={`w-6 h-6 bg-white dark:bg-black rounded-full flex items-center justify-center transform transition-transform duration-300 ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-white-400" />
        ) : (
          <Sun className="h-4 w-4 text-zinc-500" />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;
