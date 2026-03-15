import express from "express";
import { getPortfolio } from "../controllers/portfolio.controller.js";
import { auth } from "../middlewares/authmiddleware.js";

const portfolioRouter = express.Router();

portfolioRouter.get("/", auth, getPortfolio);

export default portfolioRouter; 