import { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ThemeContext } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import API_CONFIG from "@/Config";
import { showSuccess, showError } from "@/utils/toast";
import api from "@/utils/api";

export default function Register() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    dateOfBirth: Yup.string().required("Date of birth is required"),
    country: Yup.string().required("Country is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords do not match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dateOfBirth: "",
      country: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await api.post(API_CONFIG.AUTH.Register, values);
        showSuccess("Account created successfully!");
        resetForm();
        navigate("/login");
      } catch (err) {
        showError(err.response?.data?.message || "Registration failed.");
      }
    },
  });

  return (
    <div className={`min-h-screen flex relative ${isDark ? "text-white" : "text-black"}`}>

      {/* Global Theme Toggle */}
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
          <h1 className="text-5xl font-bold mb-4">Join TradeVerse</h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-300"}`}>
            Create an account and start trading smartly with real-time insights,
            automated tools, and secure portfolio tracking.
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
          {/* Title */}
          <h1 className="text-3xl font-bold mb-2 text-center">Create Your Account</h1>
          <p className={`text-sm mb-6 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Register now and start your trading journey.
          </p>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-6 w-full">
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm opacity-80">Full Name</label>
                <input
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange("name")}
                  className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                    isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                  }`}
                />
                <p className="text-xs text-red-500">{formik.errors.name}</p>
              </div>

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
                <p className="text-xs text-red-500">{formik.errors.email}</p>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <p className="text-xs text-red-500">{formik.errors.password}</p>
              </div>

              <div>
                <label className="text-sm opacity-80">Confirm Password</label>
                <input
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange("confirmPassword")}
                  className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                    isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                  }`}
                />
                <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
              </div>
            </div>

            {/* Phone & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm opacity-80">Phone Number</label>
                <input
                  type="text"
                  value={formik.values.phone}
                  onChange={formik.handleChange("phone")}
                  className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                    isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                  }`}
                />
                <p className="text-xs text-red-500">{formik.errors.phone}</p>
              </div>

              <div>
                <label className="text-sm opacity-80">Date of Birth</label>
                <input
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange("dateOfBirth")}
                  className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                    isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                  }`}
                />
                <p className="text-xs text-red-500">{formik.errors.dateOfBirth}</p>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm opacity-80">Country</label>
              <select
                value={formik.values.country}
                onChange={formik.handleChange("country")}
                className={`w-full mt-2 px-4 py-3 rounded-md border outline-none ${
                  isDark ? "bg-[#1a1a1a] border-white/10" : "bg-gray-100 border-gray-300"
                }`}
              >
                <option value="">Select Country</option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
              <p className="text-xs text-red-500">{formik.errors.country}</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-3 rounded-md font-medium ${
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black hover:bg-gray-800 text-white"
              } transition`}
            >
              {formik.isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Bottom Link */}
          <p className={`text-center text-xs mt-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
            >
              Login
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
