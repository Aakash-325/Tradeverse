import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/config.js';
import authRoute from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import errorHandler from './middlewares/errorHandler.js';
import orderRouter from './routes/order.route.js';
import walletRouter from './routes/wallet.route.js';
import tradeRouter from './routes/trade.route.js';
import marketRouter from './routes/market.route.js';
import portfolioRouter from './routes/portfolio.route.js';
import subscriptionRoute from './routes/subscription.route.js';

const app = express();

app.use(cors({
  origin: config.app.clientUrl || "http://localhost:3000",
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

app.use('/auth', authRoute);
app.use("/api/user", userRoutes);
app.use("/orders", orderRouter);
app.use('/wallet', walletRouter);
app.use('/trades', tradeRouter);
app.use('/market', marketRouter)
app.use('/portfolio', portfolioRouter);
app.use('/api', subscriptionRoute)

app.use(errorHandler);

export default app;
