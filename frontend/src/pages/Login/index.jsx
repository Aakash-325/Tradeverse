import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import API_CONFIG from "@/Config";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import api from "@/utils/api";
import { showSuccess, showError } from "@/utils/toast";

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await api.post(API_CONFIG.AUTH.Login, values);
        dispatch(login({ user: res.data.user._id, token: res.data.token }));
        showSuccess("Logged in successfully.");
        resetForm();
        navigate("/");
      } catch (err) {
        showError(err.response?.data?.message || "Login failed");
      }
    },
  });

  return (
    <div className={`min-h-screen flex relative ${isDark ? "text-white" : "text-black"}`}>

      {/* Theme Toggle - Global Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Section (65%) */}
      <div
        className={`w-[65%] hidden lg:flex flex-col justify-center items-center bg-center bg-cover relative ${
          isDark ? "bg-black" : "bg-gray-200"
        }`}
        style={{
          backgroundImage: !isDark
            ? "url('https://images.unsplash.com/photo-1642104704079-ae12f7fcec54')"
            : "none",
        }}
      >
        {!isDark && <div className="absolute inset-0 bg-black opacity-60"></div>}

        <div className="relative z-10 text-center px-10 max-w-xl">
          <h1 className="text-5xl font-bold mb-4">TradeVerse</h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-300"}`}>
            Experience real-time crypto trading with live order execution,
            advanced charts, and portfolio insights — all in one place.
          </p>
        </div>
      </div>

      {/* Right Section (35%) */}
      <div
        className={`w-full lg:w-[35%] flex justify-center items-center p-10 ${
          isDark ? "bg-[#111]" : "bg-gray-50"
        }`}
      >
        <div
          className={`w-full max-w-2xl p-10 border rounded-lg ${
            isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-300"
          }`}
        >
          {/* Heading */}
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className={`text-sm mb-6 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Login and continue your trading journey.
          </p>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6 w-full">
            <div>
              <label className="text-sm opacity-80">Email</label>
              <input
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange("email")}
                className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                  isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                }`}
              />
              <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
            </div>

            <div>
              <label className="text-sm opacity-80">Password</label>
              <input
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange("password")}
                className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                  isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                }`}
              />
              <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md font-medium ${
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black hover:bg-gray-800 text-white"
              } transition`}
            >
              {formik.isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Bottom Link */}
          <p className={`text-center text-xs mt-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
