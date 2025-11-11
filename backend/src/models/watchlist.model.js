import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    symbols: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Watchlist", watchlistSchema);
