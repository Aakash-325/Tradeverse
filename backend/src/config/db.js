import mongoose from "mongoose";
import { config } from "../config/config.js";

const db = async () => {
    await mongoose.connect(config.db.host, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
}

export default db;