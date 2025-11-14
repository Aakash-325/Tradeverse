import express from "express";
import { auth } from "../middlewares/authmiddleware.js";
import { getMarketPrice, getKline, getDepth, getTrades } from "../controllers/market.controller.js";

const marketRouter = express.Router();

marketRouter.get("/getMarketPrice", auth, getMarketPrice );
marketRouter.get("/kline", auth, getKline);
marketRouter.get("/depth", auth, getDepth);
marketRouter.get("/trades", auth, getTrades);

export default marketRouter;