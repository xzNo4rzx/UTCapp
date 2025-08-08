// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/context/PortfolioContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { loadPortfolio, savePortfolio } from "../utils/firestorePortfolio";

// ==== [BLOC: CONTEXTE] ======================================================
export const PortfolioContext = createContext();

// ==== [BLOC: CONSTANTES GLOBALES] ===========================================
const BINANCE_BASE = "https://api.binance.com";
const START_CASH = 10000;

// Liste de suivi par défaut (peut être étendue par la suite)
const DEFAULT_SYMBOLS = [
  "BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "SHIB", "AVAX", "TRX",
  "DOT", "MATIC", "LTC", "BCH", "UNI", "LINK", "XLM", "ATOM", "ETC",
  "FIL", "APT", "ARB", "OP", "NEAR", "SUI", "INJ", "TWT", "RUNE",
  "PEPE", "GMT", "LDO", "RNDR", "FTM", "EGLD", "FLOW", "GRT", "IMX",
  "STX", "ENS", "CRV", "HBAR", "CRO"
];

// ==== [BLOC: HELPERS - BINANCE] =============================================
const toBinancePair = (sym) => {
  const s = (sym || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.endsWith("USDT") ? s : `${s}USDT`;
};

const fetchBinancePrice = async (symbol) => {
  const pair = toBinancePair(symbol);
  const url = `${BINANCE_BASE}/api/v3/ticker/price?symbol=${pair}`;
  const { data } = await axios.get(url, { timeout: 7000 });
  const p = parseFloat(data?.price);
  return Number.isFinite(p) ? p : NaN;
};

const fetchBinancePricesMap = async (symbols) => {
  if (!symbols || symbols.length === 0) return {};
  const uniq = Array.from(new Set(symbols.map((s) => (s || "").toUpperCase())));
  const results = await Promise.allSettled(uniq.map(fetchBinancePrice));
  const map = {};
  uniq.forEach((s, i) => {
    const v = results[i].status === "fulfilled" ? results[i].value : NaN;
    if (Number.isFinite(v)) map[s] = v;
  });
  return map;
};

// ==== [BLOC: HELPERS - UTILS] ===============================================
const nowIso = () => new Date().toISOString();
const ms = (min) => min * 60 * 1000;

const round2 = (n) => Math.round(n * 100) / 100;
const ensureNum = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);

// ==== [BLOC: PROVIDER] ======================================================
export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();

  // ---- États persistés (localStorage + Firestore) ---------------------------
  const [portfolioName, setPortfolioName] = useState(() => {
    // PT code: PTYYYYMM-### (increment simple local)
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

  // ---- États non persistés --------------------------------------------------
  const [currentPrices, setCurrentPrices] = useState({}); // {SYM: price}
  const [lastUpdated, setLastUpdated] = useState(null);

  // snapshot de référence pour variations 5 minutes
  const [refSnapshot, setRefSnapshot] = useState({
    ts: Date.now(),
    prices: {}, // {SYM: price}
  });

  // ---- Persistences locales -------------------------------------------------
  useEffect(() => localStorage.setItem("pt_cash", String(cash)), [cash]);
  useEffect(() => localStorage.setItem("pt_positions", JSON.stringify(positions)), [positions]);
  useEffect(() => localStorage.setItem("pt_history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("pt_watchlist", JSON.stringify(watchlist)), [watchlist]);

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
  // Valeur actuelle des positions ouvertes
  const openPositionsValue = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNum(currentPrices[sym], p.buyPrice);
      total += ensureNum(p.qty, 0) * ensureNum(price, 0);
    }
    return round2(total);
  }, [positions, currentPrices]);

  // Investi = somme (qty * buyPrice) des positions encore ouvertes
  const investedAmount = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      total += ensureNum(p.qty, 0) * ensureNum(p.buyPrice, 0);
    }
    return round2(total);
  }, [positions]);

  // Profit réalisé (SELL) + latent (positions ouvertes)
  const realizedProfit = useMemo(() => {
    // On calcule sur l'historique SELL uniquement quand on a l'info pnlUSD/pnlPct,
    // sinon on dérive depuis le prix d'achat stocké dans l'event si présent.
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
    // BUY + SELL comptés comme 1 trade complet → on calcule min(countBUY, countSELL)
    const buys = history.filter((h) => h.type === "BUY").length;
    const sells = history.filter((h) => h.type === "SELL").length;
    return Math.min(buys, sells);
  }, [history]);

  const positiveTrades = useMemo(() => {
    return history.filter((h) => h.type === "SELL" && ensureNum(h.pnlUSD, 0) > 0).length;
  }, [history]);

  // ==== [BLOC: VARIATIONS 5 MINUTES] ========================================
  // map de variations en % par symbole
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

  // ==== [BLOC: MISE À JOUR DES PRIX] ========================================
  const updatePrices = async () => {
    // On met à jour les prix pour tous les symboles visibles: watchlist + positions
    const symbols = Array.from(
      new Set([
        ...watchlist.map((s) => (s || "").toUpperCase()),
        ...positions.map((p) => (p.symbol || "").toUpperCase()),
      ])
    ).filter(Boolean);

    if (symbols.length === 0) return;

    const fresh = await fetchBinancePricesMap(symbols);

    setCurrentPrices((prev) => ({ ...prev, ...fresh }));
    setLastUpdated(new Date().toISOString());

    // Si le snapshot de référence a plus de 5 minutes → on le remplace
    if (!refSnapshot.ts || Date.now() - refSnapshot.ts >= ms(5)) {
      setRefSnapshot({
        ts: Date.now(),
        prices: { ...fresh }, // on prend la nouvelle photo
      });
    }
  };

  // ==== [BLOC: ACHAT / VENTE] ===============================================
  // Achat en USD (montant fixe), quantité calculée automatiquement
  const buyPosition = async (symbol, usdAmount) => {
    symbol = (symbol || "").toUpperCase();
    const amountUSD = round2(ensureNum(usdAmount, 0));
    if (amountUSD <= 0) return;

    // Bloque un achat au-delà du cash disponible
    if (amountUSD > cash) {
      // On refuse l'achat si pas assez de cash (exigence utilisateur)
      return;
    }

    const price = await fetchBinancePrice(symbol);
    if (!Number.isFinite(price) || price <= 0) return;

    const qty = round2(amountUSD / price);
    if (qty <= 0) return;

    const buyEvent = {
      id: `BUY-${Date.now()}`,
      type: "BUY",
      symbol,
      qty,
      price,
      at: nowIso(),
    };

    setCash((c) => round2(c - amountUSD));
    setPositions((prev) => [
      {
        id: `POS-${Date.now()}`,
        symbol,
        qty,
        buyPrice: price,
        buyAt: buyEvent.at,
      },
      ...prev,
    ]);
    setHistory((h) => [buyEvent, ...h]);

    // met à jour le prix courant pour activer tout de suite le bouton VENTE
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
  };

  // Vente (percent = 0-100), option priceNow pour forcer un prix précis
  const sellPosition = async (symbol, percent = 100, priceNow = null) => {
    symbol = (symbol || "").toUpperCase();
    percent = Math.min(100, Math.max(0, ensureNum(percent, 100)));

    if (positions.length === 0) return;

    // On vend d'abord la première position ouverte correspondante (simple)
    const idx = positions.findIndex((p) => (p.symbol || "").toUpperCase() === symbol);
    if (idx < 0) return;

    const pos = positions[idx];
    const market = Number.isFinite(priceNow) ? priceNow : await fetchBinancePrice(symbol);
    const price = ensureNum(market, pos.buyPrice);

    const sellQty = percent >= 100 ? pos.qty : round2((ensureNum(pos.qty, 0) * percent) / 100);
    if (sellQty <= 0) return;

    const proceeds = round2(sellQty * price);
    const pnlUSD = round2((price - ensureNum(pos.buyPrice, 0)) * sellQty);

    const sellEvent = {
      id: `SELL-${Date.now()}`,
      type: "SELL",
      symbol,
      qty: sellQty,
      price,
      at: nowIso(),
      pnlUSD,
      pnlPct: ensureNum(pos.buyPrice, 0) > 0 ? round2(((price - pos.buyPrice) / pos.buyPrice) * 100) : 0,
      buyPrice: pos.buyPrice, // utile pour calcul postérieur
    };

    // maj du cash
    setCash((c) => round2(c + proceeds));

    // maj positions
    setPositions((prev) => {
      const newQty = round2(ensureNum(pos.qty, 0) - sellQty);
      const updated = [...prev];
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx] = { ...pos, qty: newQty };
      return updated;
    });

    setHistory((h) => [sellEvent, ...h]);

    // maj prix courant
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
  };

  // ==== [BLOC: RESET PORTFOLIO] =============================================
  // Remet le cash à 10k, vide positions mais conserve l'historique (bilan).
  const resetPortfolio = () => {
    setCash(START_CASH);
    setPositions([]);
    // Historique conservé pour bilan global
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
      priceChange5m,

      // ACTIONS
      setWatchlist,
      updatePrices,
      buyPosition, // (symbol, usdAmount)
      sellPosition, // (symbol, percent, priceNow?)
      resetPortfolio,
      setPortfolioName, // si besoin
    }),
    [
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
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Bascule 100% BINANCE pour les prix (suppression CryptoCompare).
// - Achat en USD strict (buyPosition(symbol, usdAmount)), blocage si montant > cash.
// - Calculs P&L complets: réalisé (historique SELL) + latent (positions ouvertes).
// - positionsMap généré pour activer immédiatement les boutons Vente dans l’UI.
// - updatePrices consolide watchlist + positions, snapshot 5 minutes pour variations (priceChange5m).
// - Synchronisation locale (localStorage) + Firestore (best-effort): cash, positions, history, watchlist.
// - Remise à 10 000$ via resetPortfolio tout en conservant l’historique pour le bilan.
// - Annotations de blocs ajoutées pour modifications ciblées.
// - Signature publique stable pour Trading.jsx / Profile.jsx / TopMovers.jsx / CryptoList.jsx.