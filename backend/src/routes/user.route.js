import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { auth } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/me", auth, getUserProfile);

export default router;
