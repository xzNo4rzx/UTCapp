import React, { createContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { loadPortfolio, savePortfolio } from "../utils/firestorePortfolio";
import { apiGetPrice, apiGetPrices } from "../utils/api";

export const PortfolioContext = createContext();

const START_CASH = 10000;

const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC",
  "FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX",
  "STX","ENS","CRV","HBAR","CRO"
];

const fetchBackendPrice = async (symbol) => {
  const sym = String(symbol || "").toUpperCase();
  const { price } = await apiGetPrice(sym);
  const p = Number(price);
  return Number.isFinite(p) ? p : NaN;
};

const fetchBackendPricesMap = async (symbols) => {
  if (!symbols || symbols.length === 0) return {};
  const uniq = Array.from(new Set(symbols.map((s) => (s || "").toUpperCase())));
  const { prices: mp = {} } = await apiGetPrices(uniq);
  const out = {};
  for (const s of uniq) {
    const v = Number(mp?.[s]);
    if (Number.isFinite(v)) out[s] = v;
  }
  return out;
};

const nowIso = () => new Date().toISOString();
const ms = (min) => min * 60 * 1000;
const round2 = (n) => Math.round(n * 100) / 100;
const ensureNum = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);

export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();

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
  const [lastUpdated, setLastUpdated] = useState(null);

  const [refSnapshot, setRefSnapshot] = useState({ ts: Date.now(), prices: {} });

  const priceHistoryRef = useRef({});
  const MAX_POINTS = 2000;

  const pushHistoryPoint = useCallback((map, ts) => {
    const ref = priceHistoryRef.current;
    for (const sym of Object.keys(map || {})) {
      const p = map[sym];
      if (p == null) continue;
      if (!ref[sym]) ref[sym] = [];
      const arr = ref[sym];
      const last = arr[arr.length - 1];
      if (!last || last.p !== p) {
        arr.push({ t: ts, p });
        if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
      }
    }
  }, []);

  const getPriceAtAge = useCallback((symbol, ageMs, asOfTs) => {
    const arr = priceHistoryRef.current[symbol];
    if (!arr || arr.length === 0) return null;
    const target = asOfTs - ageMs;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].t <= target) return arr[i].p;
    }
    return arr[0]?.p ?? null;
  }, []);

  const getDeltas = useCallback((symbol) => {
    const cur = currentPrices[symbol];
    if (cur == null) return { "1m": null, "5m": null, "10m": null, "1h": null, "6h": null, "1d": null, "7d": null };
    const asOfTs = lastUpdated ? Date.parse(lastUpdated) : Date.now();
    const base = (old) => (old != null && old > 0 ? ((cur - old) / old) * 100 : null);
    return {
      "1m":  base(getPriceAtAge(symbol, 1 * 60 * 1000, asOfTs)),
      "5m":  base(getPriceAtAge(symbol, 5 * 60 * 1000, asOfTs)),
      "10m": base(getPriceAtAge(symbol,10 * 60 * 1000, asOfTs)),
      "1h":  base(getPriceAtAge(symbol,60 * 60 * 1000, asOfTs)),
      "6h":  base(getPriceAtAge(symbol,6 * 60 * 60 * 1000, asOfTs)),
      "1d":  base(getPriceAtAge(symbol,24 * 60 * 60 * 1000, asOfTs)),
      "7d":  base(getPriceAtAge(symbol,7 * 24 * 60 * 60 * 1000, asOfTs)),
    };
  }, [currentPrices, lastUpdated, getPriceAtAge]);

  useEffect(() => localStorage.setItem("pt_cash", String(cash)), [cash]);
  useEffect(() => localStorage.setItem("pt_positions", JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem("pt_history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("pt_watchlist", JSON.stringify(watchlist)), [watchlist]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await loadPortfolio(user.uid);
        if (data && mounted) {
          if (data.portfolioName) setPortfolioName(data.portfolioName);
          if (Number.isFinite(data.cash)) setCash(data.cash);
          if (Array.isArray(data.positions)) setPositions(data.positions);
          if (Array.isArray(data.history)) setHistory(data.history);
          if (Array.isArray(data.watchlist) && data.watchlist.length) setWatchlist(data.watchlist);
        }
      } catch {}
    };
    load();
    return () => (mounted = false);
  }, [user]);

  useEffect(() => {
    const save = async () => {
      if (!user) return;
      try {
        await savePortfolio(user.uid, {
          portfolioName,
          cash,
          positions,
          history,
          watchlist,
          lastUpdated,
        });
      } catch {}
    };
    save();
  }, [user, portfolioName, cash, positions, history, watchlist, lastUpdated]);

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
    for (const p of positions) {
      total += ensureNum(p.qty, 0) * ensureNum(p.buyPrice, 0);
    }
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

  const priceChange5m = useMemo(() => {
    const out = {};
    const ref = refSnapshot.prices || {};
    for (const sym of Object.keys(currentPrices)) {
      const cur = ensureNum(currentPrices[sym], NaN);
      const base = ensureNum(ref[sym], NaN);
      if (Number.isFinite(cur) && Number.isFinite(base) && base > 0) {
        out[sym] = round2(((cur - base) / base) * 100);
      }
    }
    return out;
  }, [currentPrices, refSnapshot]);

  const updatePrices = async () => {
    const symbols = Array.from(
      new Set([
        ...watchlist.map((s) => (s || "").toUpperCase()),
        ...positions.map((p) => (p.symbol || "").toUpperCase()),
      ])
    ).filter(Boolean);
    if (symbols.length === 0) return;
    const fresh = await fetchBackendPricesMap(symbols);
    const ts = Date.now();
    setCurrentPrices((prev) => ({ ...prev, ...fresh }));
    setLastUpdated(new Date(ts).toISOString());
    pushHistoryPoint(fresh, ts);
    if (!refSnapshot.ts || ts - refSnapshot.ts >= ms(5)) {
      setRefSnapshot({ ts, prices: { ...fresh } });
    }
  };

  const buyPosition = async (symbol, usdAmount) => {
    symbol = (symbol || "").toUpperCase();
    const amountUSD = round2(ensureNum(usdAmount, 0));
    if (amountUSD <= 0) return;
    if (amountUSD > cash) return;
    const price = await fetchBackendPrice(symbol);
    if (!Number.isFinite(price) || price <= 0) return;
    const qty = round2(amountUSD / price);
    if (qty <= 0) return;
    const buyEvent = { id: `BUY-${Date.now()}`, type: "BUY", symbol, qty, price, at: nowIso() };
    setCash((c) => round2(c - amountUSD));
    setPositions((prev) => [{ id: `POS-${Date.now()}`, symbol, qty, buyPrice: price, buyAt: buyEvent.at }, ...prev]);
    setHistory((h) => [buyEvent, ...h]);
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
    const ts = Date.now();
    pushHistoryPoint({ [symbol]: price }, ts);
    setLastUpdated(new Date(ts).toISOString());
  };

  const sellPosition = async (symbol, percent = 100, priceNow = null) => {
    symbol = (symbol || "").toUpperCase();
    percent = Math.min(100, Math.max(0, ensureNum(percent, 100)));
    if (positions.length === 0) return;
    const idx = positions.findIndex((p) => (p.symbol || "").toUpperCase() === symbol);
    if (idx < 0) return;
    const pos = positions[idx];
    const market = Number.isFinite(priceNow) ? priceNow : await fetchBackendPrice(symbol);
    const price = ensureNum(market, pos.buyPrice);
    const sellQty = percent >= 100 ? pos.qty : round2((ensureNum(pos.qty, 0) * percent) / 100);
    if (sellQty <= 0) return;
    const proceeds = round2(sellQty * price);
    const pnlUSD = round2((price - ensureNum(pos.buyPrice, 0)) * sellQty);
    const sellEvent = {
      id: `SELL-${Date.now()}`, type: "SELL", symbol, qty: sellQty, price, at: nowIso(),
      pnlUSD, pnlPct: ensureNum(pos.buyPrice, 0) > 0 ? round2(((price - pos.buyPrice) / pos.buyPrice) * 100) : 0, buyPrice: pos.buyPrice
    };
    setCash((c) => round2(c + proceeds));
    setPositions((prev) => {
      const newQty = round2(ensureNum(pos.qty, 0) - sellQty);
      const updated = [...prev];
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx] = { ...pos, qty: newQty };
      return updated;
    });
    setHistory((h) => [sellEvent, ...h]);
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
    const ts = Date.now();
    pushHistoryPoint({ [symbol]: price }, ts);
    setLastUpdated(new Date(ts).toISOString());
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
      priceChange5m,
      setWatchlist,
      updatePrices,
      buyPosition,
      sellPosition,
      resetPortfolio,
      setPortfolioName,
      getDeltas
    }),
    [
      portfolioName, cash, positions, history, watchlist, currentPrices, lastUpdated, positionsMap,
      investedAmount, openPositionsValue, totalValue, totalProfit, totalProfitPercent, activePositionsCount,
      totalTrades, positiveTrades, priceChange5m, updatePrices, buyPosition, sellPosition, getDeltas
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};