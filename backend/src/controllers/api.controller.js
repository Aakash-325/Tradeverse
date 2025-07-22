import {
    getCandles,
    getTrades,
    getOrderBooks,
    getMarketData,
    subscribeToSymbol,
    unsubscribeFromSymbol
  } from '../services/binance.service.js';
  
  export const subscribe = (req, res) => {
    const symbol = req.params.symbol.toLowerCase();
    subscribeToSymbol(symbol);
    res.json({ message: `✅ Subscribed to ${symbol}` });
  };
  
  export const unsubscribe = (req, res) => {
    const symbol = req.params.symbol.toLowerCase();
    unsubscribeFromSymbol(symbol);
    res.json({ message: `✅ Unsubscribed from ${symbol}` });
  };
  
  export const fetchCandles = (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const data = getCandles(symbol);
    if (!data) return res.status(404).json({ message: '⚠️ No candle data found.' });
    res.json({ symbol, ...data });
  };
  
  export const fetchTrades = (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const data = getTrades(symbol);
    if (!data) return res.status(404).json({ message: '⚠️ No trade data found.' });
    res.json({ symbol, ...data });
  };
  
  export const fetchOrderBooks = (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const data = getOrderBooks(symbol);
    if (!data) return res.status(404).json({ message: '⚠️ No order book data found.' });
    res.json({ symbol, ...data });
  };
  
  export const fetchMarketData = (req, res) => {
    const marketData = getMarketData();
    if (!marketData || marketData.length === 0) {
      return res.status(404).json({ message: '⚠️ Market data not found.' });
    }
    res.json(marketData);
  };
  