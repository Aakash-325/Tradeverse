import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/config.js';
import authRoute from './routes/auth.route.js';
import errorHandler from './middlewares/errorHandler.js';
import testRouter from './routes/test.route.js';
import orderRoute from './routes/order.route.js';

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
app.use("/orders", orderRoute);
app.use('/test', testRouter); 

app.use(errorHandler);

export default app;
