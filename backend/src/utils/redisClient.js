import Redis from "ioredis";
import { config } from "../config/config.js";

export const redis = new Redis(config.redis?.url || "redis://localhost:6379");

redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("Redis Error:", err.message));
