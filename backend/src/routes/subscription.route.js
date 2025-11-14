import express from "express";
import { subscribeMarket, unsubscribeMarket } from "../controllers/subscription.controller.js";

const subscriptionRoute = express.Router();

subscriptionRoute.post("/subscribe", subscribeMarket);
subscriptionRoute.post("/unsubscribe", unsubscribeMarket);

export default subscriptionRoute;
