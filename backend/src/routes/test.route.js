import express from "express";
import { subscribeToSymbol } from "../services/binanceFeed.service.js";

const testRouter = express.Router();

// Temporary test route to manually subscribe
testRouter.get("/subscribe/:symbol", (req, res) => {
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ message: "Symbol required" });

  subscribeToSymbol(symbol.toUpperCase());
  res.json({ message: `Subscribed to ${symbol.toUpperCase()} streams` });
});

export default testRouter;
