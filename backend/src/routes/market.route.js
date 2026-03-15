import express from "express";
import { getMarketPrice, getKline, getDepth, getTrades } from "../controllers/market.controller.js";

const marketRouter = express.Router();

marketRouter.get("/getMarketPrice", getMarketPrice );
marketRouter.get("/kline", getKline);
marketRouter.get("/depth", getDepth);
marketRouter.get("/trades", getTrades);

export default marketRouter;