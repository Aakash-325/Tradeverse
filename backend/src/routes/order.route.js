import express from 'express';
import { buyOrder, sellOrder } from '../controllers/order.controller.js';
import {auth} from '../middlewares/authmiddleware.js'


const orderRoute = express.Router();

orderRoute.post('/buy', auth, buyOrder);
orderRoute.post('/sell', auth, sellOrder);

export default orderRoute;