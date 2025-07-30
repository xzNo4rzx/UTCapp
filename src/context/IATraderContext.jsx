import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const IATraderContext = createContext();

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = "https://min-api.cryptocompare.com/data";

const getPrice = async (symbol) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/price`, {
      params: { fsym: symbol, tsyms: "USD", api_key: API_KEY },
    });
    return data?.USD ?? null;
  } catch {
    return null;
  }
};

export const IATraderProvider = ({ children }) => {
  const [iaName, setIaName] = useState(() => {
    const now = new Date();
    const base = `IAPT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stored = JSON.parse(localStorage.getItem("ia-names") || "[]");
    const count = (stored.filter(n => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    localStorage.setItem("ia-names", JSON.stringify([...stored, name]));
    return name;
  });

  const [iaStart] = useState(() => new Date().toISOString());
  const [iaCash, setIaCash] = useState(() => 10000);
  const [iaPositions, setIaPositions] = useState([]);
  const [iaHistory, setIaHistory] = useState([]);
  const [iaCurrentPrices, setIaCurrentPrices] = useState({});
  const [lastSignalId, setLastSignalId] = useState(null);

  const updateIaPrices = async () => {
    const syms = iaPositions.map(p => p.symbol);
    const priceMap = {};
    for (const sym of syms) {
      const price = await getPrice(sym);
      if (price) priceMap[sym] = price;
    }
    setIaCurrentPrices(priceMap);
  };

  const buy = async (symbol, price) => {
    const quantity = (iaCash / 3) / price;
    const id = `${Date.now()}-${symbol}`;
    const investment = quantity * price;

    setIaPositions(prev => [
      ...prev,
      { id, symbol, quantity, buyPrice: price, date: new Date().toISOString(), tp: 3, sl: 5 }
    ]);
    setIaCash(c => c - investment);
    setIaHistory(h => [
      {
        id,
        type: "buy",
        symbol,
        quantity,
        buyPrice: price,
        investment,
        date: new Date().toISOString()
      },
      ...h,
    ]);
  };

  const sell = (positionId, quantity, sellPrice) => {
    const pos = iaPositions.find(p => p.id === positionId);
    if (!pos || quantity > pos.quantity) return;
    const proceeds = quantity * sellPrice;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    setIaPositions(prev =>
      prev
        .map(p => p.id === positionId ? { ...p, quantity: p.quantity - quantity } : p)
        .filter(p => p.quantity > 0)
    );
    setIaCash(c => c + proceeds);
    setIaHistory(h => [
      {
        id: Date.now(),
        type: "sell",
        symbol: pos.symbol,
        quantity,
        buyPrice: pos.buyPrice,
        sellPrice,
        profit,
        investment: cost,
        date: new Date().toISOString()
      },
      ...h,
    ]);
  };

  const resetIATrader = () => {
    const now = new Date();
    const pt = {
      name: iaName,
      start: iaStart,
      end: now.toISOString(),
      result: (iaCash + investedAmount).toFixed(2),
      percent: (((iaCash + investedAmount - 10000) / 10000) * 100).toFixed(2)
    };
    const prev = JSON.parse(localStorage.getItem("ia-pt-history") || "[]");
    localStorage.setItem("ia-pt-history", JSON.stringify([pt, ...prev]));
    setIaCash(10000);
    setIaPositions([]);
    setIaHistory([]);
    setIaCurrentPrices({});
    const base = `IAPT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stored = JSON.parse(localStorage.getItem("ia-names") || "[]");
    const count = (stored.filter(n => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    localStorage.setItem("ia-names", JSON.stringify([...stored, name]));
    setIaName(name);
  };

  useEffect(() => {
    updateIaPrices();
  }, [iaPositions]);

  // 🔁 Exécution automatique sur signal
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/utcapp/signals");
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const newest = json[json.length - 1];
        if (newest.timestamp !== lastSignalId && newest.type !== "CONTEXT") {
          const price = await getPrice(newest.crypto.split("/")[0]);
          if (price) await buy(newest.crypto.split("/")[0], price);
          setLastSignalId(newest.timestamp);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSignalId]);

  // 🧠 TP/SL en continu
  useEffect(() => {
    const interval = setInterval(() => {
      iaPositions.forEach(p => {
        const curr = iaCurrentPrices[p.symbol] ?? 0;
        if (p.tp && curr >= p.buyPrice * (1 + p.tp / 100)) sell(p.id, p.quantity, curr);
        else if (p.sl && curr <= p.buyPrice * (1 - p.sl / 100)) sell(p.id, p.quantity, curr);
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [iaCurrentPrices, iaPositions]);

  const investedAmount = iaPositions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0);

  const iaTotalProfit =
    iaHistory.filter(t => t.type === "sell").reduce((sum, t) => sum + t.profit, 0) +
    iaPositions.reduce((sum, p) => {
      const curr = iaCurrentPrices[p.symbol] ?? 0;
      return sum + p.quantity * (curr - p.buyPrice);
    }, 0);

  const iaTotalProfitPercent = investedAmount ? (iaTotalProfit / 10000) * 100 : 0;

  return (
    <IATraderContext.Provider
      value={{
        iaName,
        iaStart,
        iaCash,
        iaPositions,
        iaHistory,
        iaCurrentPrices,
        iaTotalProfit,
        iaTotalProfitPercent,
        updateIaPrices,
        resetIATrader,
      }}
    >
      {children}
    </IATraderContext.Provider>
  );
};