import { Outlet } from "react-router-dom";
import Header from "@/components/Header"
import Footer from "@/components/Footer";
import Sidebar from "@/components/SideBar"

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
