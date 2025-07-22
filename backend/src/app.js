import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import BinanceRoute from './routes/api.route.js';
import { config } from './config/config.js';
import authRoute from './routes/auth.route.js';
import errorHandler from './middlewares/errorHandler.js'
import orderRoute from './routes/order.route.js';
import watchListRoute from './routes/watchList.route.js';

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
app.use('/api/v1', BinanceRoute);
app.use('/order', orderRoute);
app.use('/watch', watchListRoute)

app.use(errorHandler);

export default app;
