import Sidebar from "@/layouts/SideBar";
import Header from "@/layouts/Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const MainLayout = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div
      className={`flex w-full min-h-screen transition ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-black"
      }`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 h-full">
        <Header />

        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
