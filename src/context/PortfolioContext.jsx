import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PortfolioContext = createContext();

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = "https://min-api.cryptocompare.com/data";

const getCurrentPrices = async (symbols) => {
  if (symbols.length === 0) return {};
  const url = `${BASE_URL}/pricemulti?fsyms=${symbols.join(",")}&tsyms=USD&api_key=${API_KEY}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error("Erreur récupération des prix :", err);
    return {};
  }
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioName, setPortfolioName] = useState(() => {
    const now = new Date();
    const base = `PT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stored = JSON.parse(localStorage.getItem("ptNames") || "[]");
    const count = (stored.filter((n) => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    localStorage.setItem("ptNames", JSON.stringify([...stored, name]));
    return name;
  });

  const [cash, setCash] = useState(() => {
    const stored = localStorage.getItem("pt-cash");
    return stored ? parseFloat(stored) : 10000;
  });

  const [positions, setPositions] = useState(() => {
    const stored = localStorage.getItem("pt-positions");
    return stored ? JSON.parse(stored) : [];
  });

  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("pt-history");
    return stored ? JSON.parse(stored) : [];
  });

  const [currentPrices, setCurrentPrices] = useState({});

  useEffect(() => {
    localStorage.setItem("pt-cash", cash.toString());
  }, [cash]);

  useEffect(() => {
    localStorage.setItem("pt-positions", JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("pt-history", JSON.stringify(history));
  }, [history]);

  const updatePrices = async () => {
    const syms = positions.map((p) => p.symbol);
    const freshPrices = await getCurrentPrices(syms);
    const map = {};
    for (const sym of syms) {
      map[sym] = freshPrices[sym]?.USD ?? null;
    }
    setCurrentPrices(map);
  };

  useEffect(() => {
    updatePrices();
  }, [positions]);

  const investedAmount = positions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0);
  const activePositionsCount = positions.length;
  const totalTrades = history.length / 2; // 1 trade = buy+sell
  const positiveTrades = history.filter((t) => t.type === "sell" && t.profit > 0).length;

  const totalProfit = history
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + t.profit, 0) +
    positions.reduce((sum, p) => {
      const curr = currentPrices[p.symbol] ?? 0;
      return sum + p.quantity * (curr - p.buyPrice);
    }, 0);

  const totalProfitPercent = investedAmount
    ? (totalProfit / (10000)) * 100
    : 0;

  const buyPosition = (symbol, quantity, price) => {
    const id = Date.now();
    const investment = quantity * price;
    setPositions((prev) => [
      ...prev,
      { id, symbol, quantity, buyPrice: price, date: new Date().toISOString() },
    ]);
    setCash((c) => c - investment);
    setHistory((h) => [
      {
        id,
        type: "buy",
        symbol,
        quantity,
        buyPrice: price,
        investment,
        date: new Date().toISOString(),
      },
      ...h,
    ]);
  };

  const sellPosition = (positionId, quantity, sellPrice) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || quantity > pos.quantity) return;

    const proceeds = quantity * sellPrice;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    setPositions((prev) =>
      prev
        .map((p) =>
          p.id === positionId ? { ...p, quantity: p.quantity - quantity } : p
        )
        .filter((p) => p.quantity > 0)
    );

    setCash((c) => c + proceeds);
    setHistory((h) => [
      {
        id: Date.now(),
        type: "sell",
        symbol: pos.symbol,
        quantity,
        buyPrice: pos.buyPrice,
        sellPrice,
        profit,
        date: new Date().toISOString(),
        investment: cost,
      },
      ...h,
    ]);
  };

  const resetPortfolio = () => {
    if (
      window.confirm(
        "Confirmer la réinitialisation du portefeuille à 10 000 $ ? Cela clôturera le PT actuel."
      )
    ) {
      const now = new Date();
      const base = `PT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const stored = JSON.parse(localStorage.getItem("ptNames") || "[]");
      const count = (stored.filter((n) => n.startsWith(base)).length + 1).toString().padStart(3, "0");
      const name = `${base}-${count}`;
      localStorage.setItem("ptNames", JSON.stringify([...stored, name]));
      setPortfolioName(name);
      setCash(10000);
      setPositions([]);
      setHistory([]);
      setCurrentPrices({});
      localStorage.removeItem("pt-cash");
      localStorage.removeItem("pt-positions");
      localStorage.removeItem("pt-history");
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolioName,
        cash,
        positions,
        history,
        currentPrices,
        investedAmount,
        activePositionsCount,
        totalTrades,
        positiveTrades,
        totalProfit,
        totalProfitPercent,
        updatePrices,
        buyPosition,
        sellPosition,
        resetPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};