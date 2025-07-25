import React, { createContext, useState, useEffect } from "react";

export const IATraderContext = createContext();

export const IATraderProvider = ({ children }) => {
  const [iaName] = useState("IA-Trader");
  const [cash, setCash] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [startDate] = useState(new Date().toISOString());
  const [currentPrices, setCurrentPrices] = useState({});

  // Simule une MAJ de prix avec variation aléatoire
  const updatePrices = async () => {
    const updated = {};
    positions.forEach((p) => {
      updated[p.symbol] = p.buyPrice * (1 + (Math.random() - 0.5) * 0.08);
    });
    setCurrentPrices(updated);
  };

  // Achat automatique d'une position
  const buy = (symbol, price, usdAmount) => {
    if (usdAmount > cash) return;
    const quantity = usdAmount / price;
    const id = Date.now();
    setPositions((prev) => [...prev, {
      id,
      symbol,
      quantity,
      buyPrice: price,
      date: new Date(),
    }]);
    setCash((c) => c - usdAmount);
    setHistory((prev) => [{
      id,
      type: "buy",
      symbol,
      quantity,
      buyPrice: price,
      date: new Date(),
    }, ...prev]);
  };

  const sell = (id, quantity, price) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;
    const proceeds = quantity * price;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    setCash((c) => c + proceeds);
    setPositions((prev) =>
      prev
        .map((p) => p.id === id ? { ...p, quantity: p.quantity - quantity } : p)
        .filter((p) => p.quantity > 0)
    );
    setHistory((prev) => [{
      id: Date.now(),
      type: "sell",
      symbol: pos.symbol,
      quantity,
      buyPrice: pos.buyPrice,
      sellPrice: price,
      profit,
      date: new Date(),
    }, ...prev]);
  };

  // Vente automatique si TP/SL
  useEffect(() => {
    const checkTP_SL = () => {
      positions.forEach((p) => {
        const curr = currentPrices[p.symbol];
        if (!curr) return;
        const perf = (curr - p.buyPrice) / p.buyPrice;
        if (perf >= 0.03 || perf <= -0.05) {
          sell(p.id, p.quantity, curr);
        }
      });
    };
    if (positions.length > 0) checkTP_SL();
  }, [currentPrices]);

  return (
    <IATraderContext.Provider
      value={{
        iaName,
        cash,
        positions,
        history,
        startDate,
        currentPrices,
        updatePrices,
        buy,
        sell,
      }}
    >
      {children}
    </IATraderContext.Provider>
  );
};