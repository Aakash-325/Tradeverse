import jwt from "jsonwebtoken";
import {config} from "../config/config.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.token.AccessKey,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    config.token.RefreshKey,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token, secret = config.token.AccessKey) => {
  return jwt.verify(token, secret);
};
