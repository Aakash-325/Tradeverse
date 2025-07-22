import express from "express";
import {register,login, logout, refreshToken} from "../controllers/auth.controller.js";

const authRoute  = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.post("/refresh", refreshToken);

export default authRoute;