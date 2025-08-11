import React, { createContext, useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiGetDeltas } from "../utils/api";

export const PortfolioContext = createContext();

const START_CASH = 10000;
const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC","FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX","STX","ENS","CRV","HBAR","CRO"
];

const round2 = (n) => Math.round(n * 100) / 100;
const ensureNum = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);

export const PortfolioProvider = ({ children }) => {
  const [portfolioName, setPortfolioName] = useState(() => {
    const d = new Date();
    const tag = `PT${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = Number(localStorage.getItem("ptCounter") || "1");
    const name = `${tag}-${String(n).padStart(3, "0")}`;
    if (!localStorage.getItem("portfolioName")) {
      localStorage.setItem("portfolioName", name);
      localStorage.setItem("ptCounter", String(n + 1));
    }
    return localStorage.getItem("portfolioName") || name;
  });

  const [cash, setCash] = useState(() => {
    const v = Number(localStorage.getItem("pt_cash"));
    return Number.isFinite(v) && v >= 0 ? v : START_CASH;
  });

  const [positions, setPositions] = useState(() => {
    try {
      const raw = localStorage.getItem("pt_positions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("pt_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem("pt_watchlist");
      const list = raw ? JSON.parse(raw) : DEFAULT_SYMBOLS;
      return Array.isArray(list) && list.length ? list : DEFAULT_SYMBOLS;
    } catch {
      return DEFAULT_SYMBOLS;
    }
  });

  const [currentPrices, setCurrentPrices] = useState({});
  const [serverDeltas, setServerDeltas] = useState({}); // {SYM: {'1m': x, ...}}
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => localStorage.setItem("pt_cash", String(cash)), [cash]);
  useEffect(() => localStorage.setItem("pt_positions", JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem("pt_history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("pt_watchlist", JSON.stringify(watchlist)), [watchlist]);

  const updatePrices = async () => {
    const symbols = Array.from(
      new Set([
        ...watchlist.map((s) => (s || "").toUpperCase()),
        ...positions.map((p) => (p.symbol || "").toUpperCase()),
      ])
    ).filter(Boolean);

    if (!symbols.length) return;

    try {
      const [{ prices = {}, updatedAt: up1 }, { deltas = {}, updatedAt: up2 }] = await Promise.all([
        apiGetPrices(symbols),
        apiGetDeltas(symbols, ["1m","5m","10m","1h","6h","1d","7d"]),
      ]);

      const cleanPrices = {};
      for (const k of Object.keys(prices)) {
        const n = Number(prices[k]);
        if (Number.isFinite(n)) cleanPrices[k.toUpperCase()] = n;
      }

      const cleanDeltas = {};
      for (const k of Object.keys(deltas || {})) {
        const m = deltas[k] || {};
        const upK = k.toUpperCase();
        cleanDeltas[upK] = {
          "1m":  Number.isFinite(m["1m"])  ? m["1m"]  : null,
          "5m":  Number.isFinite(m["5m"])  ? m["5m"]  : null,
          "10m": Number.isFinite(m["10m"]) ? m["10m"] : null,
          "1h":  Number.isFinite(m["1h"])  ? m["1h"]  : null,
          "6h":  Number.isFinite(m["6h"])  ? m["6h"]  : null,
          "1d":  Number.isFinite(m["1d"])  ? m["1d"]  : null,
          "7d":  Number.isFinite(m["7d"])  ? m["7d"]  : null,
        };
      }

      setCurrentPrices((prev) => ({ ...prev, ...cleanPrices }));
      setServerDeltas((prev) => ({ ...prev, ...cleanDeltas }));
      setLastUpdated(up2 || up1 || new Date().toISOString());
    } catch {
      // silencieux
    }
  };

  useEffect(() => {
    updatePrices();
    const iv = setInterval(updatePrices, 60 * 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.length, positions.length]);

  const positionsMap = useMemo(() => {
    const map = {};
    for (const p of positions) {
      const k = (p.symbol || "").toUpperCase();
      if (!map[k]) map[k] = [];
      map[k].push(p);
    }
    return map;
  }, [positions]);

  const openPositionsValue = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNum(currentPrices[sym], p.buyPrice);
      total += ensureNum(p.qty, 0) * ensureNum(price, 0);
    }
    return round2(total);
  }, [positions, currentPrices]);

  const investedAmount = useMemo(() => {
    let total = 0;
    for (const p of positions) total += ensureNum(p.qty, 0) * ensureNum(p.buyPrice, 0);
    return round2(total);
  }, [positions]);

  const realizedProfit = useMemo(() => {
    let acc = 0;
    for (const h of history) {
      if (h.type === "SELL") {
        if (typeof h.pnlUSD === "number") acc += h.pnlUSD;
        else if (typeof h.price === "number" && typeof h.qty === "number" && typeof h.buyPrice === "number") {
          acc += (h.price - h.buyPrice) * h.qty;
        }
      }
    }
    return round2(acc);
  }, [history]);

  const unrealizedProfit = useMemo(() => {
    let acc = 0;
    for (const p of positions) {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNum(currentPrices[sym], p.buyPrice);
      acc += (ensureNum(price, 0) - ensureNum(p.buyPrice, 0)) * ensureNum(p.qty, 0);
    }
    return round2(acc);
  }, [positions, currentPrices]);

  const totalProfit = useMemo(() => round2(realizedProfit + unrealizedProfit), [realizedProfit, unrealizedProfit]);

  const totalProfitPercent = useMemo(() => {
    const initial = START_CASH;
    const currentTotal = cash + openPositionsValue;
    const perf = ((currentTotal - initial) / initial) * 100;
    return round2(perf);
  }, [cash, openPositionsValue]);

  const totalValue = useMemo(() => round2(cash + openPositionsValue), [cash, openPositionsValue]);

  const activePositionsCount = useMemo(() => positions.length, [positions]);
  const totalTrades = useMemo(() => {
    const buys = history.filter((h) => h.type === "BUY").length;
    const sells = history.filter((h) => h.type === "SELL").length;
    return Math.min(buys, sells);
  }, [history]);

  const positiveTrades = useMemo(() => {
    return history.filter((h) => h.type === "SELL" && ensureNum(h.pnlUSD, 0) > 0).length;
  }, [history]);

  const getDeltas = (sym) => serverDeltas[(sym || "").toUpperCase()] || {
    "1m": null, "5m": null, "10m": null, "1h": null, "6h": null, "1d": null, "7d": null,
  };

  const priceChange5m = useMemo(() => {
    const out = {};
    for (const k of Object.keys(serverDeltas)) out[k] = serverDeltas[k]?.["5m"] ?? null;
    return out;
  }, [serverDeltas]);

  const buyPosition = async (symbol, usdAmount) => {
    symbol = (symbol || "").toUpperCase();
    const amountUSD = round2(ensureNum(usdAmount, 0));
    if (amountUSD <= 0) return;
    if (amountUSD > cash) return;

    const price = ensureNum(currentPrices[symbol], NaN);
    if (!Number.isFinite(price) || price <= 0) return;

    const qty = round2(amountUSD / price);
    if (qty <= 0) return;

    const atIso = new Date().toISOString();

    setCash((c) => round2(c - amountUSD));
    setPositions((prev) => [
      { id: `POS-${Date.now()}`, symbol, qty, buyPrice: price, buyAt: atIso },
      ...prev,
    ]);
    setHistory((h) => [{ id: `BUY-${Date.now()}`, type: "BUY", symbol, qty, price, at: atIso }, ...h]);
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
  };

  const sellPosition = async (symbol, percent = 100, priceNow = null) => {
    symbol = (symbol || "").toUpperCase();
    percent = Math.min(100, Math.max(0, ensureNum(percent, 100)));
    if (positions.length === 0) return;

    const idx = positions.findIndex((p) => (p.symbol || "").toUpperCase() === symbol);
    if (idx < 0) return;

    const pos = positions[idx];
    const price = Number.isFinite(priceNow) ? priceNow : ensureNum(currentPrices[symbol], pos.buyPrice);
    const sellQty = percent >= 100 ? pos.qty : round2((ensureNum(pos.qty, 0) * percent) / 100);
    if (sellQty <= 0) return;

    const proceeds = round2(sellQty * price);
    const pnlUSD = round2((price - ensureNum(pos.buyPrice, 0)) * sellQty);

    const atIso = new Date().toISOString();

    setCash((c) => round2(c + proceeds));
    setPositions((prev) => {
      const newQty = round2(ensureNum(pos.qty, 0) - sellQty);
      const updated = [...prev];
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx] = { ...pos, qty: newQty };
      return updated;
    });
    setHistory((h) => [
      { id: `SELL-${Date.now()}`, type: "SELL", symbol, qty: sellQty, price, at: atIso, pnlUSD, pnlPct: ensureNum(pos.buyPrice, 0) > 0 ? round2(((price - pos.buyPrice) / pos.buyPrice) * 100) : 0, buyPrice: pos.buyPrice },
      ...h,
    ]);
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
  };

  const resetPortfolio = () => {
    setCash(START_CASH);
    setPositions([]);
  };

  const value = useMemo(
    () => ({
      portfolioName,
      cash,
      positions,
      history,
      watchlist,
      currentPrices,
      lastUpdated,
      positionsMap,

      investedAmount,
      openPositionsValue,
      totalValue,
      totalProfit,
      totalProfitPercent,
      activePositionsCount,
      totalTrades,
      positiveTrades,

      getDeltas,
      priceChange5m,

      setWatchlist,
      updatePrices,
      buyPosition,
      sellPosition,
      resetPortfolio,
      setPortfolioName,
    }),
    [
      portfolioName, cash, positions, history, watchlist,
      currentPrices, lastUpdated, positionsMap,
      investedAmount, openPositionsValue, totalValue,
      totalProfit, totalProfitPercent, activePositionsCount, totalTrades, positiveTrades,
      getDeltas, priceChange5m,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};