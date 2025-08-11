// FICHIER: src/context/PortfolioContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { loadPortfolio, savePortfolio } from "../utils/firestorePortfolio";
import { apiGetPrices } from "../utils/api";

// ==== [BLOC: CONTEXTE] ======================================================
export const PortfolioContext = createContext();

// ==== [BLOC: CONSTANTES GLOBALES] ===========================================
const START_CASH = 10000;

// Liste de suivi par défaut (peut être étendue par la suite)
const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX",
  "DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC",
  "FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE",
  "PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX",
  "STX","ENS","CRV","HBAR","CRO"
];

// Fenêtres d’analyse demandées
const WINDOWS = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

// ==== [BLOC: UTILS] =========================================================
const nowIso   = () => new Date().toISOString();
const round2   = (n) => Math.round(n * 100) / 100;
const ensure   = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const clampPos = (n) => (Number.isFinite(n) && n > 0 ? n : 0);

// Trouver le snapshot le plus proche <= target
function findSnapshotAtOrBefore(snapshots, targetTs) {
  // snapshots triés par ts croissant
  let best = null;
  for (let i = snapshots.length - 1; i >= 0; i--) {
    const s = snapshots[i];
    if (s.ts <= targetTs) { best = s; break; }
  }
  return best;
}

// ==== [BLOC: PROVIDER] ======================================================
export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();

  // ---- États persistés (localStorage + Firestore) ---------------------------
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
    try { return JSON.parse(localStorage.getItem("pt_positions")) || []; }
    catch { return []; }
  });

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pt_history")) || []; }
    catch { return []; }
  });

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("pt_watchlist") || "null");
      return Array.isArray(raw) && raw.length ? raw : DEFAULT_SYMBOLS;
    } catch {
      return DEFAULT_SYMBOLS;
    }
  });

  // ---- États non persistés --------------------------------------------------
  const [currentPrices, setCurrentPrices] = useState({}); // {SYM: price}
  const [lastUpdated, setLastUpdated] = useState(null);

  // Historique persistant des snapshots → permet de recomposer les deltas à froid
  const [snapshots, setSnapshots] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("pt_snapshots") || "[]");
      // garde la structure [{ts:number, prices:{SYM:price}}]
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });

  // Persistences locales simples
  useEffect(() => localStorage.setItem("pt_cash", String(cash)), [cash]);
  useEffect(() => localStorage.setItem("pt_positions", JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem("pt_history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("pt_watchlist", JSON.stringify(watchlist)), [watchlist]);
  useEffect(() => localStorage.setItem("pt_snapshots", JSON.stringify(snapshots)), [snapshots]);

  // ---- Firestore sync (best-effort) ----------------------------------------
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
          // on ne synchronise pas snapshots en Firestore par design (local-only UI cache)
        }
      } catch {
        // silencieux
      }
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
      } catch {
        // silencieux
      }
    };
    save();
  }, [user, portfolioName, cash, positions, history, watchlist, lastUpdated]);

  // ==== [BLOC: POSITIONS MAP] ===============================================
  const positionsMap = useMemo(() => {
    const map = {};
    for (const p of positions) {
      const k = (p.symbol || "").toUpperCase();
      if (!map[k]) map[k] = [];
      map[k].push(p);
    }
    return map;
  }, [positions]);

  // ==== [BLOC: METRIQUES & P&L] =============================================
  const openPositionsValue = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      const sym   = (p.symbol || "").toUpperCase();
      const price = ensure(currentPrices[sym], p.buyPrice);
      total += ensure(p.qty, 0) * ensure(price, 0);
    }
    return round2(total);
  }, [positions, currentPrices]);

  const investedAmount = useMemo(() => {
    let total = 0;
    for (const p of positions) total += ensure(p.qty, 0) * ensure(p.buyPrice, 0);
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
      const sym   = (p.symbol || "").toUpperCase();
      const price = ensure(currentPrices[sym], p.buyPrice);
      acc += (ensure(price, 0) - ensure(p.buyPrice, 0)) * ensure(p.qty, 0);
    }
    return round2(acc);
  }, [positions, currentPrices]);

  const totalProfit = useMemo(
    () => round2(realizedProfit + unrealizedProfit),
    [realizedProfit, unrealizedProfit]
  );

  const totalProfitPercent = useMemo(() => {
    const initial = START_CASH;
    const currentTotal = cash + openPositionsValue;
    const perf = ((currentTotal - initial) / initial) * 100;
    return round2(perf);
  }, [cash, openPositionsValue]);

  const totalValue = useMemo(() => round2(cash + openPositionsValue), [cash, openPositionsValue]);
  const activePositionsCount = useMemo(() => positions.length, [positions]);

  const totalTrades = useMemo(() => {
    const buys  = history.filter((h) => h.type === "BUY").length;
    const sells = history.filter((h) => h.type === "SELL").length;
    return Math.min(buys, sells);
  }, [history]);

  const positiveTrades = useMemo(
    () => history.filter((h) => h.type === "SELL" && ensure(h.pnlUSD, 0) > 0).length,
    [history]
  );

  // ==== [BLOC: FETCH PRIX + SNAPSHOTS] ======================================
  const updatePrices = async () => {
    // Symbols = watchlist + positions
    const symbols = Array.from(
      new Set([
        ...watchlist.map((s) => (s || "").toUpperCase()),
        ...positions.map((p) => (p.symbol || "").toUpperCase()),
      ])
    ).filter(Boolean);

    if (!symbols.length) return;

    // 1) prix courants via backend
    const { prices: freshMap = {} } = await apiGetPrices(symbols);
    if (Object.keys(freshMap).length) {
      setCurrentPrices((prev) => ({ ...prev, ...freshMap }));
      setLastUpdated(new Date().toISOString());
    }

    // 2) snapshot persistant (pour recomposer deltas au reload)
    const snap = { ts: Date.now(), prices: freshMap };
    setSnapshots((prev) => {
      const next = [...prev, snap];
      // prune: garde 7j d’historique + borne max ~ 2000 snapshots (≈ 2/jour si 1min → OK)
      const sevenDaysAgo = Date.now() - WINDOWS["7d"];
      const pruned = next.filter((s) => s.ts >= sevenDaysAgo);
      return pruned.slice(-2000);
    });
  };

  // Auto-refresh 1 min + first load
  useEffect(() => {
    updatePrices();
    const iv = setInterval(updatePrices, 60_000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line

  // ==== [BLOC: DELTAS CALC – LOCAL FALLBACK] ================================
  // Retourne un objet { "1m": x, "5m": y, ... } en % basé sur snapshots persistés.
  const getDeltas = (symbol) => {
    const sym = String(symbol || "").toUpperCase();
    const cur = ensure(currentPrices[sym], NaN);
    if (!Number.isFinite(cur) || cur <= 0) {
      // pas de prix actuel fiable
      return {
        "1m": null, "5m": null, "10m": null,
        "1h": null, "6h": null, "1d": null, "7d": null,
      };
    }

    const now = Date.now();
    const out = {};
    for (const [label, dur] of Object.entries(WINDOWS)) {
      const target = now - dur;
      const snap = findSnapshotAtOrBefore(snapshots, target);
      const base = snap?.prices?.[sym];
      if (Number.isFinite(base) && base > 0) {
        out[label] = round2(((cur - base) / base) * 100);
      } else {
        out[label] = null;
      }
    }
    return out;
  };

  // Dérivé “5m” conservé pour compat (TopMovers si jamais il l’utilise)
  const priceChange5m = useMemo(() => {
    const out = {};
    for (const sym of Object.keys(currentPrices)) {
      const d = getDeltas(sym)["5m"];
      if (d != null) out[sym] = d;
    }
    return out;
  }, [currentPrices, snapshots]);

  // ==== [BLOC: ACHAT / VENTE] ===============================================
  const buyPosition = async (symbol, usdAmount) => {
    const sym = (symbol || "").toUpperCase();
    const amountUSD = round2(ensure(usdAmount, 0));
    if (amountUSD <= 0) return;
    if (amountUSD > cash) return;

    const price = ensure(currentPrices[sym], NaN);
    if (!Number.isFinite(price) || price <= 0) return;

    const qty = round2(amountUSD / price);
    if (qty <= 0) return;

    const buyEvent = {
      id: `BUY-${Date.now()}`,
      type: "BUY",
      symbol: sym,
      qty,
      price,
      at: nowIso(),
    };

    setCash((c) => round2(c - amountUSD));
    setPositions((prev) => [
      {
        id: `POS-${Date.now()}`,
        symbol: sym,
        qty,
        buyPrice: price,
        buyAt: buyEvent.at,
      },
      ...prev,
    ]);
    setHistory((h) => [buyEvent, ...h]);
  };

  const sellPosition = async (symbol, percent = 100, priceNow = null) => {
    const sym = (symbol || "").toUpperCase();
    const pcent = Math.min(100, Math.max(0, ensure(percent, 100)));

    if (!positions.length) return;

    const idx = positions.findIndex((p) => (p.symbol || "").toUpperCase() === sym);
    if (idx < 0) return;

    const pos   = positions[idx];
    const price = Number.isFinite(priceNow) ? priceNow : ensure(currentPrices[sym], pos.buyPrice);
    const sellQty = pcent >= 100 ? pos.qty : round2((ensure(pos.qty, 0) * pcent) / 100);
    if (sellQty <= 0) return;

    const proceeds = round2(sellQty * price);
    const pnlUSD   = round2((price - ensure(pos.buyPrice, 0)) * sellQty);

    const sellEvent = {
      id: `SELL-${Date.now()}`,
      type: "SELL",
      symbol: sym,
      qty: sellQty,
      price,
      at: nowIso(),
      pnlUSD,
      pnlPct: ensure(pos.buyPrice, 0) > 0 ? round2(((price - pos.buyPrice) / pos.buyPrice) * 100) : 0,
      buyPrice: pos.buyPrice,
    };

    setCash((c) => round2(c + proceeds));

    setPositions((prev) => {
      const newQty = round2(ensure(pos.qty, 0) - sellQty);
      const updated = [...prev];
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx] = { ...pos, qty: newQty };
      return updated;
    });

    setHistory((h) => [sellEvent, ...h]);
  };

  // ==== [BLOC: RESET PORTFOLIO] =============================================
  const resetPortfolio = () => {
    setCash(START_CASH);
    setPositions([]);
    // on garde history par choix (comme dans ta logique)
  };

  // ==== [BLOC: CONTEXTE - VALUE] ============================================
  const value = useMemo(
    () => ({
      // ÉTATS
      portfolioName,
      cash,
      positions,
      history,
      watchlist,
      currentPrices,
      lastUpdated,
      positionsMap,

      // METRIQUES
      investedAmount,
      openPositionsValue,
      totalValue,
      totalProfit,
      totalProfitPercent,
      activePositionsCount,
      totalTrades,
      positiveTrades,

      // DELTAS
      priceChange5m,
      getDeltas,

      // ACTIONS
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
      investedAmount, openPositionsValue, totalValue, totalProfit,
      totalProfitPercent, activePositionsCount, totalTrades, positiveTrades,
      priceChange5m, getDeltas,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};