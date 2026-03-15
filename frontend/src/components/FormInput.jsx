
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";

export default function FormInput({ label, type = "text", value, onChange }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full px-3 py-3 rounded-lg outline-none transition border
          ${
            isDark
              ? "bg-transparent text-white border-white/10 focus:border-blue-500"
              : "bg-gray-100 text-gray-900 border-gray-300 focus:border-blue-600"
          }
        `}
      />
      <label
        className={`form-label ${
          isDark ? "text-gray-400 peer-focus:text-blue-400" : "text-gray-600 peer-focus:text-blue-600"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
