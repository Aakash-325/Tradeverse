import { config as dotenvConfig } from "dotenv";
dotenvConfig({
    path: "./.env"
})

export const config = {
    app: {
        port: process.env.PORT || 8000,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        env:process.env.ENVIROMENT
    },
    db: {
        host: process.env.MONGODB_URI || "localhost",
    },
    token: {
        AccessKey: process.env.ACCESS_SECRET,
        RefreshKey: process.env.REFRESH_SECRET
    },
    Binance:
    {
        url: process.env.BINANCE_URL
    }
};
