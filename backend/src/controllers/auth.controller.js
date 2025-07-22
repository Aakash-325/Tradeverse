import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { verifyToken } from "../utils/token.js";
import { config } from "../config/config.js";

export const register = async (req, res) => {
  const { name, email, password, phone, country, balance } = req.body;

  if (!name || !email || !password || !phone || !country || !balance) {
    return res.status(400).json({ message: "All the fields are required!!" })
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please log in instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      country,
      balance,
    })

    await newUser.save();

    const { password: _, ...userData } = newUser._doc;

    return res.status(201).json({
      message: "User created successfully!",
      user: userData,
    });


  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ message: "Internal server error!" });
  }

}

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const { password: _, ...userData } = user._doc;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: userData,
      token: accessToken
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = verifyToken(token, config.token.RefreshKey);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const accessToken = generateAccessToken(user._id);

    return res.status(200).json({
      message: "Access token refreshed",
      token: accessToken,
    });

  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};
