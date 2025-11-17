import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Market from "@/pages/Market";
import ErrorPage from "@/pages/Error";
import Portfolio from "@/pages/Portfolio";
import Orders from "@/pages/Orders";
import DashBoard from "@/pages/Dashboard/";
import Trades from "@/pages/Trades";
import Watchlist from "@/pages/Watchlist";
import Chart from "@/pages/Chart";
import Profile from "@/pages/Profile";

import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashBoard /> },
        { path: "market", element: <Market /> },
        { path: "chart/:symbol", element: <Chart /> },
        { path: "portfolio", element: <Portfolio /> },
        { path: "orders", element: <Orders /> },
        { path: "trades", element: <Trades /> },
        { path: "watchlists", element: <Watchlist /> },
        { path: "profile", element: <Profile /> },
      ],
    },

    {
      path: "/login",
      element: <Login />,
    },

    {
      path: "/register",
      element: <Register />,
    },

    {
      path: "*",
      element: <ErrorPage />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRouter;
