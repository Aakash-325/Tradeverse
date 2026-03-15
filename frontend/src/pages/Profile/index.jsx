import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import {
  Edit, Mail, User, MapPin, Shield, Calendar, Wallet, LogOut, Phone
} from "lucide-react";
import axios from "axios";
import API_CONFIG from "@/Config";
import { showError } from "@/utils/toast";
import { useSelector } from "react-redux";
import api from "@/utils/api";

const Profile = () => {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const isDark = theme === "dark";
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(API_CONFIG.USER.Me);
        setUser(res.data.user);
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load user data");
      }
    };

    fetchUser();
  }, [token]);

  console.log("user", user);
  if (!user) return <p className="text-center mt-10">Loading...</p>;

  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  const cardStyle = `rounded-xl shadow-lg transition border ${isDark
    ? "bg-white/5 border-white/10 hover:bg-white/10"
    : "bg-white border-gray-200 hover:bg-gray-100"
    }`;

  return (
    <div
      className={`p-6 min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"
        }`}
    >
      <div className={`${cardStyle} p-6 flex flex-col md:flex-row items-center gap-6`}>

        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold shadow-md border ${isDark ? "bg-white/10 border-white/20 text-white" : "bg-gray-200 border-gray-300 text-gray-800"
            }`}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold capitalize">{user.name}</h2>
            <button
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition ${isDark
                ? "bg-white/10 border-white/10 hover:bg-white/20"
                : "bg-gray-200 border-gray-300 hover:bg-gray-300"
                }`}
            >
              <Edit size={16} /> Edit Profile
            </button>
          </div>

          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
            @{user.name?.toLowerCase()}
          </p>

          <div
            className={`flex flex-wrap gap-4 mt-4 text-sm ${isDark ? "text-gray-300" : "text-gray-700"
              }`}
          >
            <p className="flex items-center gap-2">
              <Mail size={16} /> {user.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> {user.phone || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> {user.country || "Not specified"}
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={16} /> Joined {formattedDate}
            </p>
            <p className="flex items-center gap-2">
              <Shield size={16} /> Standard User
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Wallet Holdings</h3>

        {user.wallet && Object.keys(user.wallet).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {"USDT" in user.wallet && (
              <div className={`${cardStyle} p-5`}>
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                  USDT Balance
                </p>
                <p className="text-2xl font-semibold text-green-400">
                  {user.wallet.USDT.toFixed(2)} USDT
                </p>
              </div>
            )}

            {Object.entries(user.wallet)
              .filter(([asset]) => asset !== "USDT")
              .slice(0, 2)
              .map(([asset, amount]) => (
                <div key={asset} className={`${cardStyle} p-5`}>
                  <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                    {asset} Balance
                  </p>
                  <p className="text-2xl font-semibold text-green-400">
                    {amount.toFixed(2)} {asset}
                  </p>
                </div>
              ))}
            {Object.entries(user.wallet).filter(([asset]) => asset !== "USDT").length > 2 && (
              <div
                onClick={() => (window.location.href = "/portfolio")}
                className={`${cardStyle} p-5 flex items-center justify-center cursor-pointer ${isDark ? "hover:bg-white/20" : "hover:bg-gray-200"
                  }`}
              >
                <p className="text-sm font-medium">View All Holdings →</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${cardStyle} p-6 text-center text-gray-400`}>
            No holdings yet
          </div>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div className={`${cardStyle} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>
            Investment Overview
          </h3>

          <div className="flex justify-between text-sm">
            <p>Total Realized PnL:</p>
            <p className={`${user.totalRealizedPnL >= 0 ? "text-green-400" : "text-red-400"} font-semibold`}>
              {user.totalRealizedPnL} USDT
            </p>
          </div>
          <div className="flex justify-between text-sm mt-2 opacity-80">
            <p>Wallet Assets:</p>
            <p>{Object.keys(user.wallet || {}).length} Assets</p>
          </div>
          <div className="flex justify-between text-sm mt-2 opacity-80">
            <p>Most Traded Asset:</p>
            <p>BTC/USDT</p>
          </div>
        </div>

        <div className={`${cardStyle} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>
            Account Actions
          </h3>

          <div className="flex flex-col gap-3">
            {[
              { label: "Manage Funds", icon: <Wallet size={18} /> },
              { label: "Security Settings", icon: <Shield size={18} /> },
              { label: "Account Preferences", icon: <User size={18} /> },
            ].map((btn, i) => (
              <button
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border transition ${isDark
                  ? "border-white/10 hover:bg-white/10"
                  : "border-gray-300 hover:bg-gray-200"
                  }`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}

            <button
              className={`flex items-center gap-3 p-3 rounded-lg border transition text-red-500 ${isDark
                ? "border-red-500 hover:bg-red-500/10"
                : "border-red-500 hover:bg-red-500/20"
                }`}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
