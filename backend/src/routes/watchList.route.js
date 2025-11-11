import express from "express";
import {
  createWatchlist,
  getWatchlists,
  updateWatchlistSymbols,
  deleteWatchlist,
} from '../controllers/watchList.controller.js';
import {auth} from "../middlewares/authmiddleware.js";


const watchListRoute = express.Router();

watchListRoute.post("/", auth, createWatchlist);
watchListRoute.get("/", auth, getWatchlists);
watchListRoute.put("/:id", auth, updateWatchlistSymbols);
watchListRoute.delete("/:id", auth, deleteWatchlist);

export default watchListRoute;
