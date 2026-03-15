
export function emitTradeEvents(io, userId, order, trade, portfolio, portfolioClosed, realizedPnL) {
  io.to(userId).emit("order:filled", order);

  if (portfolioClosed) {
    io.to(userId).emit("portfolio:closed", trade.symbol);
  } else {
    io.to(userId).emit("portfolio:updated", portfolio);
  }

  if (realizedPnL !== 0) {
    io.to(userId).emit("pnl:update", {
      symbol: trade.symbol,
      realizedPnL,
    });
  }

  io.to(userId).emit("trade:executed", {
    trade,
    message: `${trade.side} ${trade.quantity} ${trade.symbol.replace("USDT", "")} @ ${trade.price}`,
  });
}
