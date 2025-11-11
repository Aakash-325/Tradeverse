import Watchlist from "../models/watchlist.model.js";

export const createWatchlist = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) return res.status(400).json({ message: "Watchlist name is required." });

    try {
        const watchlist = new Watchlist({ user: userId, name });
        await watchlist.save();
        res.status(201).json(watchlist);
    } catch (err) {
        res.status(500).json({ message: "Failed to create watchlist." });
    }
};

export const getWatchlists = async (req, res) => {
    const userId = req.user.userId;

    try {
        const watchlists = await Watchlist.find({ user: userId });
        res.status(200).json(watchlists);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch watchlists." });
    }
};

export const updateWatchlistSymbols = async (req, res) => {
    const { id } = req.params;
    const { symbol, action } = req.body;
    const userId = req.user.userId;

    if (!symbol || (action !== "add" && action !== "remove")) {
        return res.status(400).json({ message: "Invalid symbol or action." });
    }


    try {
        const watchlist = await Watchlist.findOne({ _id: id, user: userId });
        if (!watchlist) return res.status(404).json({ message: "Watchlist not found." });

        const symbolUpper = symbol.toUpperCase();

        if (action === "add") {
            if (!watchlist.symbols.includes(symbolUpper)) {
                watchlist.symbols.push(symbolUpper);
            }
        } else if (action === "remove") {
            watchlist.symbols = watchlist.symbols.filter((s) => s !== symbolUpper);
        }

        await watchlist.save();
        res.status(200).json(watchlist);
    } catch (err) {
        res.status(500).json({ message: "Failed to update watchlist." });
    }
};

export const deleteWatchlist = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const deleted = await Watchlist.findOneAndDelete({ _id: id, user: userId });
        if (!deleted) return res.status(404).json({ message: "Watchlist not found." });

        res.status(200).json({ message: "Watchlist deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete watchlist." });
    }
};
