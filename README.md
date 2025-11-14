# 🚀 TradeVerse - Real-Time Crypto Trading Simulation Platform

A full-featured **virtual crypto trading platform** built with the **MERN Stack**, featuring **real-time market data**, **order execution**, **portfolio tracking**, and **live PnL updates** using **Binance WebSocket**, **Redis**, and **Socket.IO**.

This application simulates key functionalities of real exchanges like **Binance, Bybit, and Bitget**, while providing a modern API architecture ready for high-performance frontend dashboards.

---

## 🌟 Features

### 🔥 Real-Time Market Data

* Live price updates via **Binance WebSocket**
* `!miniTicker@arr` snapshot for all symbols
* Real-time updates for:

  * Kline / Candlesticks (1m)
  * Order Book Depth
  * Trades (Tape)
* Redis caching for ultra-fast reads

---

### 🛒 Trading Engine

Supports fully simulated **Market Orders**:

* BUY / SELL
* Instant execution using latest Redis price
* Updates wallet balances
* Updates portfolio holdings
* Generates trade record
* Creates order record
* Computes **Realized PnL**
* Emits Socket.IO events

---

### 📈 Portfolio & PnL

* Tracks user's crypto assets
* Average buy price calculation
* Realized & Unrealized PnL
* Auto-removal of closed positions

---

### ⭐ Watchlist System

* Create multiple watchlists
* Add/remove symbols
* Manage custom lists

---

### 🔌 Real-Time Engine

* Global Socket.IO instance
* Auto user-room joining
* Live trading events
* Market stream subscriptions

---

## 🏗 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Redis
* Socket.IO
* Binance WebSocket API
* JWT Authentication

### Architecture

* Modular Services
* Controllers & Routes
* Redis caching
* Trading Engine Layer

---

## 📁 Folder Structure

```
src/
├── app.js
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
│   ├── index.js
│   ├── auth.route.js
│   ├── user.route.js
│   ├── order.route.js
│   ├── wallet.route.js
│   ├── trade.route.js
│   ├── portfolio.route.js
│   ├── subscription.route.js
│   ├── market.route.js
├── services/
│   ├── socket.service.js
│   ├── trading/
│   │   ├── validateAndFetch.js
│   │   ├── processBuy.js
│   │   ├── processSell.js
│   │   ├── emitTradeEvents.js
│   │   └── index.js
│   ├── binanceFeed.service.js
└── utils/
    └── redisClient.js
```

---

## 🚀 Running the Backend

### 1. Clone the repo

```bash
git clone https://github.com/your-username/tradeverse-backend.git
cd tradeverse-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env`:

```
PORT=8000
MONGO_URI=your_mongo_uri
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
BINANCE_STREAM_URL=wss://stream.binance.com:9443/ws
CLIENT_URL=http://localhost:3000
```

### 4. Start server

```bash
npm run dev
```

---

## 🔌 API Endpoints

### Auth

```
POST /auth/register
POST /auth/login
```

### User

```
GET /api/user/me
```

### Wallet

```
GET /wallet
```

### Portfolio

```
GET /portfolio
```

### Orders

```
POST /orders/market
GET /orders
```

### Trades

```
GET /trades
```

### Market

```
GET /market/price
GET /market/kline
GET /market/depth
GET /market/trades
```

### Subscriptions

```
POST /api/market/subscribe?symbol=BTCUSDT
POST /api/market/unsubscribe?symbol=BTCUSDT
```

---

## 🔥 Socket.IO Live Events

* `order:filled`
* `trade:executed`
* `portfolio:updated`
* `portfolio:closed`
* `pnl:update`
* `marketData`
* `kline-SYMBOL-INTERVAL`
* `depth-SYMBOL`
* `trade-SYMBOL`

---

## 🧪 Postman Examples

### Execute Trade

```
POST /orders/market
```

Body:

```json
{
  "symbol": "BTCUSDT",
  "side": "BUY",
  "quantity": 0.01,
  "tradeType": "INTRADAY"
}
```

---

## 🛠 Future Enhancements

* Limit/Stop-Loss Orders
* Margin Trading Simulation
* Options Trading
* Notifications module
* Full Trading Terminal UI

---

## 👨‍💻 Author

**Akash Chaurasiya**
Full Stack Developer / React / Node / Real-Time Systems

---

## ⭐ Support

If you like this project:

```
⭐ Star this repo — it motivates me to build more awes
```
