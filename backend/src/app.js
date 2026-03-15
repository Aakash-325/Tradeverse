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
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export default app;
