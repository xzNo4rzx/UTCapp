import { createContext, useState, useEffect } from "react";
import axios from "axios";
import fetchSignals from "../utils/fetchSignals";
import { useAuth } from "./AuthContext";
import { loadPortfolio, savePortfolio } from "../utils/firestorePortfolio";

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

const useIAActive = () => typeof window !== "undefined" && window.location.pathname.includes("iatrader");

export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();
  const [portfolioName, setPortfolioName] = useState("");
  const [cash, setCash] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPrices, setCurrentPrices] = useState([]);
  const [nidList, setNidList] = useState([]);
  const [ptNames, setPtNames] = useState([]);

  // 🔁 Charger le portefeuille depuis Firestore à l'ouverture
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await loadPortfolio(user.uid);
      if (data) {
        setCash(data.cash ?? 10000);
        setPositions(data.positions ?? []);
        setHistory(data.history ?? []);
        setPortfolioName(data.name ?? "PT");
        setPtNames(data.ptNames ?? []);
        setNidList(data.nidList ?? []);
      }
    };
    load();
  }, [user]);

  // 🔁 Sauvegarder le portefeuille après chaque modif
  const syncToFirestore = () => {
    if (!user) return;
    savePortfolio(user.uid, {
      name: portfolioName,
      cash,
      positions,
      history,
      ptNames,
      nidList,
      updatedAt: new Date().toISOString()
    });
  };

  const updatePrices = async () => {
    const syms = positions.map((p) => p.symbol);
    const fresh = await getCurrentPrices(syms);
    const map = {};
    for (const sym of syms) map[sym] = fresh[sym]?.USD ?? null;
    setCurrentPrices(map);
  };

  useEffect(() => {
    updatePrices();

    if (useIAActive()) {
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
        } catch (e) {
          console.error("IA Trader erreur :", e);
        }
      }, 60000);
      return () => clearInterval(loop);
    }
  }, [positions]);

  const investedAmount = positions.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
  const totalProfit =
    history.filter(t => t.type === "sell").reduce((s, t) => s + t.profit, 0) +
    positions.reduce((s, p) => s + p.quantity * ((currentPrices[p.symbol] ?? 0) - p.buyPrice), 0);
  const totalProfitPercent = investedAmount ? (totalProfit / 10000) * 100 : 0;

  const buyPosition = (symbol, quantity, price, tpPercent = 0, slPercent = 0) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 16).replace(/[-T:]/g, "");
    const letter = nidList.length < 9 ? "A" : "B";
    const padded = String(nidList.length + 1).padStart(3, "0");
    const id = `${dateStr}-${padded}${letter}${(nidList.length % 9) + 1}`;

    const investment = quantity * price;
    const newPos = [...positions, { id, symbol, quantity, buyPrice: price, date: now.toISOString(), tpPercent, slPercent }];
    const newHistory = [{ id, type: "buy", symbol, quantity, buyPrice: price, investment, date: now.toISOString() }, ...history];

    setNidList([...nidList, id]);
    setPositions(newPos);
    setCash(cash - investment);
    setHistory(newHistory);

    syncToFirestore();
  };

  const sellPosition = (positionId, quantity, sellPrice) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos || quantity > pos.quantity) return;

    const proceeds = quantity * sellPrice;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    const newPositions = positions.map((p) =>
      p.id === positionId ? { ...p, quantity: p.quantity - quantity } : p
    ).filter((p) => p.quantity > 0);

    setPositions(newPositions);
    setCash(cash + proceeds);
    setHistory([
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
      ...history,
    ]);

    syncToFirestore();
  };

  const resetPortfolio = () => {
    const now = new Date();
    const base = `PT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = (ptNames.filter((n) => n.startsWith(base)).length + 1).toString().padStart(3, "0");
    const name = `${base}-${count}`;
    setPtNames([...ptNames, name]);
    setPortfolioName(name);
    setCash(10000);
    setPositions([]);
    setHistory([]);
    setNidList([]);
    setCurrentPrices({});
    syncToFirestore();
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
        activePositionsCount: positions.length,
        totalTrades: history.filter(t => t.type === "buy").length,
        positiveTrades: history.filter(t => t.type === "sell" && t.profit > 0).length,
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