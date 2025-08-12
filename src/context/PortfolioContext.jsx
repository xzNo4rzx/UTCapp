// FICHIER: src/context/PortfolioContext.jsx
import React, { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiGetPrices } from "../utils/api";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

// ====== CONSTANTES ===========================================================
export const PortfolioContext = createContext();
const START_CASH = 10000;

// Liste de suivi par défaut (mêmes tickers que le projet)
const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX",
  "DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC",
  "FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE",
  "PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX",
  "STX","ENS","CRV","HBAR","CRO"
];

// Fenêtres d’analyse demandées
const WINDOWS = ["1m","5m","10m","1h","6h","1d","7d"];

// Utils
const nowIso = () => new Date().toISOString();
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ensureNum = (v, fb = 0) => (Number.isFinite(v) ? v : fb);
const up = (s) => String(s || "").toUpperCase();

// ====== DOC FIRESTORE PAR DEFAUT ============================================
function defaultPortfolioDoc() {
  return {
    portfolioName: `PT${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, "0")}-001`,
    cash: START_CASH,
    positions: [],                 // [{id, symbol, qty, buyPrice, buyAt}]
    history: [],                   // [{id, type: 'BUY'|'SELL', symbol, qty, price, at, pnlUSD?, pnlPct?, buyPrice?}]
    watchlist: DEFAULT_SYMBOLS,
    lastUpdated: null,             // ISO
    // Référence de snapshot COMMUNE (partagée par le même compte entre tous les devices)
    // stockée côté serveur pour que tout le monde ait les mêmes deltas.
    snapRef: {
      ts: null,                    // timestamp ms de calcul de la ref
      prices: {}                   // {SYM: priceRef}
    }
  };
}

// ====== PROVIDER ============================================================
export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();

  // Etats “live” client (issus du serveur + API prix)
  const [portfolioName, setPortfolioName] = useState("");
  const [cash, setCash]                   = useState(START_CASH);
  const [positions, setPositions]         = useState([]);       // tableau d'objets position
  const [history, setHistory]             = useState([]);
  const [watchlist, setWatchlist]         = useState(DEFAULT_SYMBOLS);
  const [snapRef, setSnapRef]             = useState({ ts: null, prices: {} });

  const [currentPrices, setCurrentPrices] = useState({});       // {SYM: price} (API)
  const [lastUpdated, setLastUpdated]     = useState(null);     // ISO

  // ---- Subscription Firestore (source de vérité unique) --------------------
  useEffect(() => {
    if (!user?.uid) return;
    const ref = doc(db, "portfolios", user.uid);

    let unsub = () => {};
    (async () => {
      // Crée le doc si absent
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, defaultPortfolioDoc(), { merge: true });
      }
      // Ecoute temps réel
      unsub = onSnapshot(ref, (d) => {
        const data = d.data() || {};
        setPortfolioName(data.portfolioName || "");
        setCash(ensureNum(data.cash, START_CASH));
        setPositions(Array.isArray(data.positions) ? data.positions : []);
        setHistory(Array.isArray(data.history) ? data.history : []);
        setWatchlist(Array.isArray(data.watchlist) && data.watchlist.length ? data.watchlist : DEFAULT_SYMBOLS);
        setLastUpdated(data.lastUpdated || null);
        setSnapRef({
          ts: data.snapRef?.ts ?? null,
          prices: data.snapRef?.prices ?? {},
        });
      });
    })();

    return () => unsub();
  }, [user]);

  // ---- Positions map (par symbole) -----------------------------------------
  const positionsMap = useMemo(() => {
    const map = {};
    for (const p of positions) {
      const k = up(p.symbol);
      if (!map[k]) map[k] = [];
      map[k].push(p);
    }
    return map;
  }, [positions]);

  // ---- Métriques ------------------------------------------------------------
  const openPositionsValue = useMemo(() => {
    let total = 0;
    for (const p of positions) {
      const sym = up(p.symbol);
      const px  = ensureNum(currentPrices[sym], p.buyPrice);
      total += ensureNum(p.qty, 0) * ensureNum(px, 0);
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
        if (Number.isFinite(h.pnlUSD)) acc += h.pnlUSD;
        else if (Number.isFinite(h.price) && Number.isFinite(h.qty) && Number.isFinite(h.buyPrice)) {
          acc += (h.price - h.buyPrice) * h.qty;
        }
      }
    }
    return round2(acc);
  }, [history]);

  const unrealizedProfit = useMemo(() => {
    let acc = 0;
    for (const p of positions) {
      const sym = up(p.symbol);
      const px  = ensureNum(currentPrices[sym], p.buyPrice);
      acc += (ensureNum(px, 0) - ensureNum(p.buyPrice, 0)) * ensureNum(p.qty, 0);
    }
    return round2(acc);
  }, [positions, currentPrices]);

  const totalProfit        = useMemo(() => round2(realizedProfit + unrealizedProfit), [realizedProfit, unrealizedProfit]);
  const totalValue         = useMemo(() => round2(cash + openPositionsValue), [cash, openPositionsValue]);
  const totalProfitPercent = useMemo(() => round2(((totalValue - START_CASH) / START_CASH) * 100), [totalValue]);

  const activePositionsCount = useMemo(() => positions.length, [positions]);
  const totalTrades = useMemo(() => {
    const buys = history.filter(h => h.type === "BUY").length;
    const sells = history.filter(h => h.type === "SELL").length;
    return Math.min(buys, sells);
  }, [history]);

  const positiveTrades = useMemo(() => history.filter(h => h.type === "SELL" && ensureNum(h.pnlUSD, 0) > 0).length, [history]);

  // ---- DELTAS à partir de la ref partagée snapRef --------------------------
  // getDeltas(sym) => { "1m": x, "5m": y, ... } basé sur snapRef.prices[sym] vs currentPrices[sym]
  // NB: tant que le backend /deltas n’est pas disponible, on s’aligne au moins
  //     sur une même ref pour tous les devices (snapRef en Firestore).
  const getDeltas = (symbol) => {
    const sym = up(symbol);
    const cur = ensureNum(currentPrices[sym], NaN);
    const base = ensureNum(snapRef.prices?.[sym], NaN);
    // Si pas de ref commune, affiche des tirets (évite divergences per‑device)
    if (!Number.isFinite(cur) || !Number.isFinite(base) || base <= 0) {
      return { "1m": null, "5m": null, "10m": null, "1h": null, "6h": null, "1d": null, "7d": null };
    }
    // En attendant les fenêtres multiples serveur, on applique la même ref “commune”.
    const pct = round2(((cur - base) / base) * 100);
    return { "1m": pct, "5m": pct, "10m": pct, "1h": pct, "6h": pct, "1d": pct, "7d": pct };
  };

  // ---- MAJ DES PRIX (backend) ----------------------------------------------
  const updatePrices = async () => {
    try {
      const symbols = Array.from(new Set([
        ...watchlist.map(up),
        ...positions.map(p => up(p.symbol)),
      ])).filter(Boolean);

      if (!symbols.length) return;

      // Appel backend
      const { prices = {} } = await apiGetPrices(symbols);
      const parsed = {};
      for (const k of Object.keys(prices)) {
        const v = Number(prices[k]);
        if (Number.isFinite(v)) parsed[up(k)] = v;
      }

      setCurrentPrices(prev => ({ ...prev, ...parsed }));
      const iso = nowIso();
      setLastUpdated(iso);

      // on persiste uniquement la date côté serveur (les prix restent un flux volatile côté client)
      if (user?.uid) {
        await updateDoc(doc(db, "portfolios", user.uid), { lastUpdated: iso });
      }
    } catch (e) {
      // silencieux console
      // console.error("[updatePrices] fail:", e);
    }
  };

  // ---- ACHAT / VENTE (écritures Firestore) ---------------------------------
  const buyPosition = async (symbol, usdAmount) => {
    if (!user?.uid) return;
    const sym = up(symbol);
    const amountUSD = round2(ensureNum(usdAmount, 0));
    if (amountUSD <= 0) return;

    // Prix du marché depuis API (synchronisé avec l’affichage)
    const { prices = {} } = await apiGetPrices([sym]);
    const price = Number(prices[sym]);
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

    const ref = doc(db, "portfolios", user.uid);
    const snap = await getDoc(ref);
    const data = snap.data() || defaultPortfolioDoc();

    const nextCash = round2(ensureNum(data.cash, START_CASH) - amountUSD);
    if (nextCash < 0) return;

    const nextPositions = [
      { id: `POS-${Date.now()}`, symbol: sym, qty, buyPrice: price, buyAt: buyEvent.at },
      ...(Array.isArray(data.positions) ? data.positions : []),
    ];
    const nextHistory = [buyEvent, ...(Array.isArray(data.history) ? data.history : [])];

    await updateDoc(ref, {
      cash: nextCash,
      positions: nextPositions,
      history: nextHistory,
    });
  };

  const sellPosition = async (symbol, percent = 100, priceNow = null) => {
    if (!user?.uid) return;
    const sym = up(symbol);
    const pct = Math.min(100, Math.max(0, ensureNum(percent, 100)));

    const ref = doc(db, "portfolios", user.uid);
    const snap = await getDoc(ref);
    const data = snap.data() || defaultPortfolioDoc();
    const positionsArr = Array.isArray(data.positions) ? data.positions : [];

    const idx = positionsArr.findIndex(p => up(p.symbol) === sym);
    if (idx < 0) return;

    const pos = positionsArr[idx];
    let marketPrice = Number(priceNow);
    if (!Number.isFinite(marketPrice) || marketPrice <= 0) {
      const { prices = {} } = await apiGetPrices([sym]);
      marketPrice = Number(prices[sym]);
      if (!Number.isFinite(marketPrice) || marketPrice <= 0) return;
    }

    const sellQty = pct >= 100 ? pos.qty : round2((ensureNum(pos.qty, 0) * pct) / 100);
    if (sellQty <= 0) return;

    const proceeds = round2(sellQty * marketPrice);
    const pnlUSD = round2((marketPrice - ensureNum(pos.buyPrice, 0)) * sellQty);
    const sellEvent = {
      id: `SELL-${Date.now()}`,
      type: "SELL",
      symbol: sym,
      qty: sellQty,
      price: marketPrice,
      at: nowIso(),
      pnlUSD,
      pnlPct: ensureNum(pos.buyPrice, 0) > 0 ? round2(((marketPrice - pos.buyPrice) / pos.buyPrice) * 100) : 0,
      buyPrice: pos.buyPrice,
    };

    // Met à jour positions
    const newQty = round2(ensureNum(pos.qty, 0) - sellQty);
    const nextPositions = [...positionsArr];
    if (newQty <= 0) nextPositions.splice(idx, 1);
    else nextPositions[idx] = { ...pos, qty: newQty };

    const nextCash = round2(ensureNum(data.cash, START_CASH) + proceeds);
    const nextHistory = [sellEvent, ...(Array.isArray(data.history) ? data.history : [])];

    await updateDoc(ref, {
      cash: nextCash,
      positions: nextPositions,
      history: nextHistory,
    });
  };

  // ---- RESET PT -------------------------------------------------------------
  const resetPortfolio = async () => {
    if (!user?.uid) return;
    const ref = doc(db, "portfolios", user.uid);
    await updateDoc(ref, {
      cash: START_CASH,
      positions: [],
      // On garde l'historique ? Le besoin a varié selon les pages; ici on le conserve
      // pour cohérence avec “RESET PT TO 10000$ et conserver historique” validé.
      // Si tu veux le purger aussi, remplace par: history: []
    });
  };

  // ---- SNAPSHOT COMMUN (administrable ici si besoin) ------------------------
  // Si tu veux forcer une nouvelle ref commune (ex: toutes les 5 min côté admin),
  // appelle setSharedSnapshotRef(). Pour l’instant on ne l’appelle pas automatiquement.
  const setSharedSnapshotRef = async () => {
    if (!user?.uid) return;
    const symbols = Array.from(new Set([
      ...watchlist.map(up),
      ...positions.map(p => up(p.symbol)),
    ])).filter(Boolean);

    if (!symbols.length) return;

    const { prices = {} } = await apiGetPrices(symbols);
    const parsed = {};
    for (const k of Object.keys(prices)) {
      const v = Number(prices[k]);
      if (Number.isFinite(v)) parsed[up(k)] = v;
    }

    await updateDoc(doc(db, "portfolios", user.uid), {
      snapRef: { ts: Date.now(), prices: parsed },
    });
  };

  // ---- Auto refresh des PRIX toutes les 60s --------------------------------
  useEffect(() => {
    updatePrices();
    const iv = setInterval(updatePrices, 60_000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, watchlist.length, positions.length]);

  // ---- VALEUR CONTEXTE ------------------------------------------------------
  const value = useMemo(() => ({
    // Etats
    portfolioName,
    cash,
    positions,
    history,
    watchlist,
    currentPrices,
    lastUpdated,
    positionsMap,

    // Métriques
    investedAmount,
    openPositionsValue,
    totalValue,
    totalProfit,
    totalProfitPercent,
    activePositionsCount,
    totalTrades,
    positiveTrades,

    // Deltas
    getDeltas,

    // Actions
    setWatchlist,
    updatePrices,
    buyPosition,
    sellPosition,
    resetPortfolio,
    setPortfolioName,

    // Admin/helper (optionnel)
    setSharedSnapshotRef,
  }), [
    portfolioName, cash, positions, history, watchlist,
    currentPrices, lastUpdated, positionsMap,
    investedAmount, openPositionsValue, totalValue, totalProfit, totalProfitPercent,
    activePositionsCount, totalTrades, positiveTrades,
  ]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};