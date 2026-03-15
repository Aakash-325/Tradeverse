import User from "../../models/user.model.js";
import { getLatestPrice } from "../binanceFeed.service.js";

export async function validateAndFetch(userId, symbol, side, quantity) {
  if (!symbol || !side || !quantity || quantity <= 0)
    throw new Error("Invalid order parameters");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const symb = symbol.toUpperCase();
  const baseAsset = symb.replace("USDT", "");
  const quoteAsset = "USDT";

  const marketData = await getLatestPrice(symb);
  if (!marketData) throw new Error("No market data available");
  if (Date.now() - marketData.ts > 10000)
    throw new Error("Stale market data");

  const price = parseFloat(marketData.price);
  const total = price * quantity;

  return { user, symb, baseAsset, quoteAsset, price, total };
}
