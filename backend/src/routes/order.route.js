import express from "express";
import { placeMarketOrder } from "../controllers/order.controller.js";
import { auth } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Market Order Route
router.post("/market", auth, placeMarketOrder);

export default router;
