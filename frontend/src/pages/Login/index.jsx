import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import API_CONFIG from "@/Config";
import { showSuccess, showError } from "@/utils/toast";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await axios.post(API_CONFIG.AUTH.Login, values);
        dispatch(login({
          user:res.data.user._id,
          token:res.data.token,
        }))
        showSuccess("Logged in successfully.");
        resetForm();
        navigate('/');
        
      } catch (err) {
        showError(err.response?.data?.message || "Login failed. Try again.");
      }
    },
  });

  const inputStyle = `
    w-full mt-2 px-3 py-2 rounded-md border outline-none transition
  `;

  const lightInput = "bg-gray-100 border-gray-300 text-gray-900";
  const darkInput = "bg-[#1a1a1a] border-white/10 text-white";

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        isDark ? "bg-black" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-xl p-10 rounded-xl border shadow-lg relative ${
          isDark
            ? "bg-[#111] border-white/10 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <ThemeToggle />

        <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
        <p
          className={`text-sm mb-8 text-center ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Login and continue your trading journey.
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="text-sm opacity-80">Email</label>
            <input
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange("email")}
              className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
            />
            <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm opacity-80">Password</label>
            <input
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange("password")}
              className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
            />
            <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
          </div>

          {/* Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-sm transition ${
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {formik.isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Bottom Link */}
        <p
          className={`text-center text-xs mt-6 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Don’t have an account?{" "}
          <Link
            to="/register"
            className={`font-medium ${
              isDark
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
