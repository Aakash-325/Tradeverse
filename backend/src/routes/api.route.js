// routes/binanceRoutes.js
import express from "express";
import {
  subscribe,
  unsubscribe,
  fetchCandles,
  fetchTrades,
  fetchOrderBooks,
  fetchMarketData
} from "../controllers/api.controller.js";

const BinanceRoute = express.Router();

// For testing Binance API

BinanceRoute.post("/subscribe/:symbol", subscribe);
BinanceRoute.post("/unsubscribe/:symbol", unsubscribe);
BinanceRoute.get("/getCandles/:symbol", fetchCandles);
BinanceRoute.get("/getTrades/:symbol", fetchTrades);
BinanceRoute.get("/getOrderBooks/:symbol", fetchOrderBooks);
BinanceRoute.get("/getMarketData", fetchMarketData);

export default BinanceRoute;
