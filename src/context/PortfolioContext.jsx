import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import fetchSignals from "../utils/fetchSignals";
import { useLocation } from "react-router-dom";

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

const useIAActive = () => {
  if (typeof window !== "undefined") {
    return window.location.pathname.includes("iatrader");
  }
  return false;
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

  const [cash, setCash] = useState(() => parseFloat(localStorage.getItem("pt-cash")) || 10000);
  const [positions, setPositions] = useState(() => JSON.parse(localStorage.getItem("pt-positions")) || []);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("pt-history")) || []);
  const [currentPrices, setCurrentPrices] = useState({});

  useEffect(() => localStorage.setItem("pt-cash", cash.toString()), [cash]);
  useEffect(() => localStorage.setItem("pt-positions", JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem("pt-history", JSON.stringify(history)), [history]);

  const updatePrices = async () => {
    const syms = positions.map((p) => p.symbol);
    const fresh = await getCurrentPrices(syms);
    const map = {};
    for (const sym of syms) map[sym] = fresh[sym]?.USD ?? null;
    setCurrentPrices(map);
  };

  useEffect(() => {
    updatePrices();

    const activeIA = useIAActive();
    if (activeIA) {
      const loop = setInterval(async () => {
        try {
          const { signals } = await fetchSignals();
          if (!signals?.length) return;

          const latest = signals[0];
          const already = positions.some(p => p.symbol === latest.crypto);
          if (already || cash < 10) return;

          const prices = await getCurrentPrices([latest.crypto]);
          const curr = prices[latest.crypto]?.USD;
          if (!curr) return;

          const invest = cash / 3;
          const qty = invest / curr;
          const tp = 3, sl = 5;
          buyPosition(latest.crypto, qty, curr, tp, sl);
          console.log("🤖 IA Trader : achat", latest.crypto, qty, "@", curr);
        } catch (e) {
          console.error("IA Trader erreur :", e);
        }
      }, 60_000);
      return () => clearInterval(loop);
    }
  }, [positions]);

  const investedAmount = positions.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
  const activePositionsCount = positions.length;
  const totalTrades = history.filter(t => t.type === "buy").length;
  const positiveTrades = history.filter(t => t.type === "sell" && t.profit > 0).length;

  const totalProfit =
    history.filter((t) => t.type === "sell").reduce((s, t) => s + t.profit, 0) +
    positions.reduce((s, p) => s + p.quantity * ((currentPrices[p.symbol] ?? 0) - p.buyPrice), 0);

  const totalProfitPercent = investedAmount ? (totalProfit / 10000) * 100 : 0;

  const buyPosition = (symbol, quantity, price, tpPercent = 0, slPercent = 0) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace(/[-T:]/g, "").slice(2);
    const stored = JSON.parse(localStorage.getItem("pt-nid") || "[]");
    const letter = stored.length < 9 ? "A" : "B";
    const padded = (stored.length + 1).toString().padStart(3, "0");
    const id = `${dateStr}-${padded}${letter}${(stored.length % 9) + 1}`;
    localStorage.setItem("pt-nid", JSON.stringify([...stored, id]));

    const investment = quantity * price;
    setPositions((prev) => [...prev, { id, symbol, quantity, buyPrice: price, date: now.toISOString(), tpPercent, slPercent }]);
    setCash((c) => c - investment);
    setHistory((h) => [{ id, type: "buy", symbol, quantity, buyPrice: price, investment, date: now.toISOString() }, ...h]);
  };

  const sellPosition = (positionId, quantity, sellPrice) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || quantity > pos.quantity) return;

    const proceeds = quantity * sellPrice;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    setPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, quantity: p.quantity - quantity } : p)).filter((p) => p.quantity > 0)
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
    const now = new Date();
    const base = `PT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const stored = JSON.parse(localStorage.getItem("ptNames") || "[]");
    const count = (stored.filter((n) => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    localStorage.setItem("ptNames", JSON.stringify([...stored, name]));
    localStorage.removeItem("pt-nid");
    setPortfolioName(name);
    setCash(10000);
    setPositions([]);
    setHistory([]);
    setCurrentPrices({});
    localStorage.removeItem("pt-cash");
    localStorage.removeItem("pt-positions");
    localStorage.removeItem("pt-history");
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