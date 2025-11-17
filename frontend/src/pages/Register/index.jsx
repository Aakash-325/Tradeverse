import { useContext } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ThemeContext } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import API_CONFIG from "@/Config";
import { showSuccess, showError } from "@/utils/toast";
import { Link } from "react-router-dom";

export default function Register() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

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
        await axios.post(API_CONFIG.AUTH.Register, values);
        showSuccess("Account created successfully!");
        resetForm();
      } catch (err) {
        showError(err.response?.data?.message || "Registration failed. Try again.");
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
      className={`min-h-screen flex items-center justify-center px-4 ${isDark ? "bg-black" : "bg-gray-100"
        }`}
    >
      <div
        className={`w-full max-w-xl p-10 rounded-xl border shadow-lg relative ${isDark
            ? "bg-[#111] border-white/10 text-white"
            : "bg-white border-gray-200 text-gray-900"
          }`}
      >
        <ThemeToggle />

        <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
        <p className="text-sm mb-8 opacity-70">
          Register now and start your trading journey.
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm opacity-80">Full Name</label>
              <input
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange("name")}
                className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
              />
              <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
            </div>

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
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            <div>
              <label className="text-sm opacity-80">Confirm Password</label>
              <input
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange("confirmPassword")}
                className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
              />
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.confirmPassword}
              </p>
            </div>
          </div>

          {/* Phone + DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm opacity-80">Phone Number</label>
              <input
                type="text"
                value={formik.values.phone}
                onChange={formik.handleChange("phone")}
                className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
              />
              <p className="text-xs text-red-500 mt-1">{formik.errors.phone}</p>
            </div>

            <div>
              <label className="text-sm opacity-80">Date of Birth</label>
              <input
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange("dateOfBirth")}
                className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
              />
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.dateOfBirth}
              </p>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-sm opacity-80">Country</label>
            <select
              value={formik.values.country}
              onChange={formik.handleChange("country")}
              className={`${inputStyle} ${isDark ? darkInput : lightInput}`}
            >
              <option value="">Select Country</option>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
            <p className="text-xs text-red-500 mt-1">{formik.errors.country}</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium text-sm transition ${isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-black hover:bg-gray-800 text-white"
              }`}
          >
            {formik.isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p
          className={`text-center text-xs mt-6 ${isDark ? "text-gray-400" : "text-gray-600"
            }`}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-medium ${isDark
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
              }`}
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
