import express from "express";
import { placeMarketOrder } from "../controllers/order.controller.js";
import { auth } from "../middlewares/authmiddleware.js";
import { getOrders } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/get", auth, getOrders);

orderRouter.post("/place", auth, placeMarketOrder);

export default orderRouter;
