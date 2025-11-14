import express from "express";
import { getTrades } from "../controllers/trade.controller.js";
import { auth } from "../middlewares/authmiddleware.js";

const tradeRouter = express.Router();

tradeRouter.get("/", auth, getTrades);

export default tradeRouter;