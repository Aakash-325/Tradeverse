import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/config.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({
  origin: config.app.clientUrl || "http://localhost:3000",
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export default app;
