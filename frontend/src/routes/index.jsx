import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import DashBoard from "@/pages/DashBoard";
import WatchList from "@/pages/WatchList";
import PortFolio from "@/pages/PortFolio";
import Order from "@/pages/Order";
import MyAccount from "@/pages/MyAccount";
import MainLayout from "@/Layout/MainLayout";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<DashBoard />} />
          <Route path="/watchlist" element={<WatchList />} />
          <Route path="/portfolio" element={<PortFolio />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/myaccount" element={<MyAccount />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
