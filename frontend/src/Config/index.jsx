export const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const AUTH = {
  Register: `${BASE_URL}/api/auth/register`,
  Login: `${BASE_URL}/api/auth/login`,
  Logout: `${BASE_URL}/api/auth/logout`,
  Refresh: `${BASE_URL}/api/auth/refresh`,
};

const USER = {
  Me: `${BASE_URL}/api/user/me`,
};

const ORDERS = {
  GetOrders: `${BASE_URL}/api/orders/get`,
  PlaceOrder: `${BASE_URL}/api/orders/place`,
};

const MARKET = {
  MarketPrice: `${BASE_URL}/api/market/getMarketPrice`,
  Kline: `${BASE_URL}/api/market/kline`,
  Depth: `${BASE_URL}/api/market/depth`,
  Trades: `${BASE_URL}/api/market/trades`,
};

const PORTFOLIO = {
  GetPortfolio: `${BASE_URL}/api/portfolio`,
};

const WALLET = {
  GetWallet: `${BASE_URL}/api/wallet`,
};

const WATCHLIST = {
  Create: `${BASE_URL}/api/watchlist`,
  GetAll: `${BASE_URL}/api/watchlist`,
  Update: (id) => `${BASE_URL}/api/watchlist/${id}`,
  Delete: (id) => `${BASE_URL}/api/watchlist/${id}`,
};

const TRADES = {
  UserTrades: `${BASE_URL}/api/trades`,
};

const SUBSCRIPTION = {
  Subscribe: `${BASE_URL}/api/subscription/subscribe`,
  Unsubscribe: `${BASE_URL}/api/subscription/unsubscribe`,
};

// SOCKET.IO (IF REQUIRED)
const SOCKET = {
  URL: import.meta.env.VITE_APP_SOCKET_URL,
};

const API_CONFIG = {
  AUTH,
  USER,
  ORDERS,
  MARKET,
  PORTFOLIO,
  WALLET,
  WATCHLIST,
  TRADES,
  SUBSCRIPTION,
  SOCKET,
};

export default API_CONFIG;
