// src/context/PortfolioContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import fetchPrices from '../utils/fetchPrices';

export const PortfolioContext = createContext();

const INITIAL_CASH = 10000;
const makeId = () => {
  const d = new Date().toISOString().slice(0,10).replace(/-/g,'');
  return `PT${d}-001`;
};

const makeInitial = () => ({
  id: makeId(),
  startDate: new Date().toISOString(),
  initialCash: INITIAL_CASH,
  cash: INITIAL_CASH,
  invested: 0,
  positions: {},         // { BTC: { amount, entryPrice, currentPrice }, … }
  history: [],
  cumulativeUsd: 0,      // gain/perte en USD
  cumulativePercent: 0,  // gain/perte en %
});

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(makeInitial());

  // Helper pour recalc P&L
  const recalc = (prev, pricesMap) => {
    const positions = { ...prev.positions };
    // mettre à jour currentPrice
    Object.entries(positions).forEach(([sym, pos]) => {
      if (pricesMap[sym] != null) pos.currentPrice = pricesMap[sym];
    });

    // recalculer investi et valeur de marché
    const invested = Object.values(positions)
      .reduce((sum, p) => sum + p.amount * p.entryPrice, 0);
    const marketValue = Object.values(positions)
      .reduce((sum, p) => sum + p.amount * p.currentPrice, 0);

    const cumulativeUsd = prev.cash + marketValue - prev.initialCash;
    const cumulativePercent = (cumulativeUsd / prev.initialCash) * 100;

    return {
      ...prev,
      positions,
      invested,
      cumulativeUsd,
      cumulativePercent,
    };
  };

  // Achat
  const buy = (symbol, price, amountUsd) => {
    setPortfolio(prev => {
      const qty = amountUsd / price;
      const existing = prev.positions[symbol] || { amount: 0, entryPrice: 0, currentPrice: price };
      const totalCost = existing.amount * existing.entryPrice + amountUsd;
      const totalQty  = existing.amount + qty;
      const newAvg    = totalCost / totalQty;
      const newPos = { amount: totalQty, entryPrice: newAvg, currentPrice: price };

      const newHistory = [
        ...prev.history,
        { date: new Date().toISOString(), type: 'buy', symbol, amountUsd, price, entryPrice: newAvg }
      ];
      return {
        ...prev,
        cash: prev.cash - amountUsd,
        history: newHistory,
        positions: { ...prev.positions, [symbol]: newPos }
      };
    });
  };

  // Vente
  const sell = (symbol, price, amountUsd) => {
    setPortfolio(prev => {
      const existing = prev.positions[symbol];
      if (!existing) return prev;
      const qtyToSell = amountUsd / price;
      const remainingQty = existing.amount - qtyToSell;
      const newPos = remainingQty > 0
        ? { ...existing, amount: remainingQty }
        : undefined;

      const newHistory = [
        ...prev.history,
        { date: new Date().toISOString(), type: 'sell', symbol, amountUsd, price, entryPrice: existing.entryPrice }
      ];

      return {
        ...prev,
        cash: prev.cash + amountUsd,
        history: newHistory,
        positions: newPos
          ? { ...prev.positions, [symbol]: newPos }
          : Object.fromEntries(Object.entries(prev.positions).filter(([s]) => s !== symbol))
      };
    });
  };

  // Reset complet
  const reset = () => setPortfolio(makeInitial());

  // Effet périodique pour rafraîchir les cours et recalc P&L
  useEffect(() => {
    const tick = async () => {
      const { top5Up, top5Down, rest } = await fetchPrices();
      const all = [...top5Up, ...top5Down, ...rest];
      const pricesMap = all.reduce((m, c) => {
        m[c.symbol] = c.currentPrice; return m;
      }, {});
      setPortfolio(prev => recalc(prev, pricesMap));
    };
    tick();
    const iv = setInterval(tick, 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, buy, sell, reset }}>
      {children}
    </PortfolioContext.Provider>
  );
};