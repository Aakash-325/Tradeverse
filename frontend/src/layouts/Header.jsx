import { IoMdLogOut } from "react-icons/io";
import ThemeToggle from "@/components/ThemeToggle";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className={`w-full h-16 border-b flex items-center justify-between px-6 transition ${
        isDark ? "bg-[#0f0f0f] border-white/10" : "bg-white border-gray-200"
      }`}
    >
      {/* LEFT AREA (EMPTY BUT RESERVED FOR SPACING / FUTURE USE) */}
      <div className="flex items-center gap-3"></div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* 1. Theme Toggle */}
        <div className="flex-none">
          <ThemeToggle />
        </div>

        {/* 2. Avatar */}
        <div className="flex-none">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || user || "User"
            )}&background=1E40AF&color=fff&size=64`}
            alt="avatar"
            className="w-8 h-8 rounded-full border border-white/10 object-cover cursor-pointer"
          />
        </div>

        {/* 3. Logout */}
        <div className="flex-none">
          <button
            onClick={handleLogout}
            className={`transition ${
              isDark
                ? "text-white hover:text-gray-400"
                : "text-gray-900 hover:text-gray-600"
            }`}
            aria-label="Logout"
          >
            <IoMdLogOut size={26} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
