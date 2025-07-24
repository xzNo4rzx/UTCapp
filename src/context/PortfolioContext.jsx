import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PortfolioContext = createContext();

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = "https://min-api.cryptocompare.com/data";

const getCurrentPrices = async (symbols) => {
  if (symbols.length === 0) return {};
  const url = `${BASE_URL}/pricemulti?fsyms=${symbols.join(",")}&tsyms=USD&api_key=${API_KEY}`;
  const { data } = await axios.get(url);
  return symbols.reduce((acc, sym) => {
    acc[sym] = data[sym]?.USD ?? null;
    return acc;
  }, {});
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioName] = useState(() => {
    const now = new Date();
    const base = `PT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stored = JSON.parse(localStorage.getItem("ptNames") || "[]");
    const count = (stored.filter((n) => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    localStorage.setItem("ptNames", JSON.stringify([...stored, name]));
    return name;
  });

  const [cash, setCash] = useState(() => parseFloat(localStorage.getItem("pt_cash")) || 10000);
  const [positions, setPositions] = useState(() => JSON.parse(localStorage.getItem("pt_positions") || "[]"));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("pt_history") || "[]"));
  const [currentPrices, setCurrentPrices] = useState({});
  const [startTime] = useState(() => localStorage.getItem("pt_start") || new Date().toISOString());

  useEffect(() => {
    localStorage.setItem("pt_cash", cash.toString());
    localStorage.setItem("pt_positions", JSON.stringify(positions));
    localStorage.setItem("pt_history", JSON.stringify(history));
    localStorage.setItem("pt_start", startTime);
  }, [cash, positions, history, startTime]);

  const updatePrices = async () => {
    const symbols = positions.map((p) => p.symbol);
    const updated = await getCurrentPrices(symbols);
    setCurrentPrices(updated);
  };

  const investedAmount = positions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0);
  const currentValue = positions.reduce((sum, p) => {
    const curr = currentPrices[p.symbol];
    return curr ? sum + p.quantity * curr : sum;
  }, 0);

  const totalRealizedProfit = history
    .filter((t) => t.type === "SELL")
    .reduce((sum, t) => sum + (t.profit || 0), 0);

  const totalProfit = currentValue + cash - 10000;
  const totalProfitPercent = (totalProfit / 10000) * 100;

  const buyPosition = (symbol, quantity, price) => {
    const id = Date.now();
    const investment = quantity * price;

    const newPosition = {
      id,
      symbol,
      quantity,
      buyPrice: price,
      date: new Date().toISOString(),
    };

    setPositions((prev) => [...prev, newPosition]);
    setCash((prev) => prev - investment);

    setHistory((prev) => [
      {
        id,
        type: "BUY",
        date: new Date().toISOString(),
        symbol,
        quantity,
        buyPrice: price,
        value: investment,
      },
      ...prev,
    ]);
  };

  const sellPosition = (positionId, quantity, sellPrice) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || quantity > pos.quantity) return;

    const proceeds = quantity * sellPrice;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    const updated = positions
      .map((p) => (p.id === positionId ? { ...p, quantity: p.quantity - quantity } : p))
      .filter((p) => p.quantity > 0);

    setPositions(updated);
    setCash((prev) => prev + proceeds);

    setHistory((prev) => [
      {
        id: Date.now(),
        type: "SELL",
        date: new Date().toISOString(),
        symbol: pos.symbol,
        quantity,
        buyPrice: pos.buyPrice,
        sellPrice,
        profit,
        originBuyId: pos.id,
      },
      ...prev,
    ]);
  };

  const resetPortfolio = () => {
    if (
      confirm("Cette action est irréversible. Le portefeuille sera remis à 10 000 $ et toutes les positions actuelles seront perdues.")
    ) {
      localStorage.removeItem("pt_cash");
      localStorage.removeItem("pt_positions");
      localStorage.removeItem("pt_history");
      localStorage.removeItem("pt_start");
      window.location.reload();
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
        currentValue,
        totalProfit,
        totalProfitPercent,
        totalTrades: history.filter((t) => t.type === "SELL").length,
        positiveTrades: history.filter((t) => t.type === "SELL" && t.profit >= 0).length,
        updatePrices,
        buyPosition,
        sellPosition,
        resetPortfolio,
        startTime,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};