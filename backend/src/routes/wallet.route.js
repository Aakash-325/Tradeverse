import express from "express";
import { getWallet } from "../controllers/wallet.controller.js";
import { auth } from "../middlewares/authmiddleware.js";

const walletRouter = express.Router();

walletRouter.get("/", auth, getWallet);

export default walletRouter;