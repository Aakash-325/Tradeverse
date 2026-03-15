import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 flex items-center rounded-full transition-all duration-300 cursor-pointer
        ${isDark ? "bg-gray-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}
