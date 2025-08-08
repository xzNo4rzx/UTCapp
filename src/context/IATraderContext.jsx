// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/context/IATraderContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { loadIATrader, saveIATrader } from "../utils/firestoreIATrader";

// ==== [BLOC: CONTEXTE] ======================================================
export const IATraderContext = createContext();

// ==== [BLOC: CONSTANTES] ====================================================
const BINANCE_BASE = "https://api.binance.com";
const getApiBase = () => import.meta.env.VITE_API_BASE || "http://localhost:8000";

const DEFAULT_RULES = Object.freeze({
  // Investit 1/3 du cash dispo par signal
  buyFraction: 1 / 3,
  // TP 3% - SL 5%
  takeProfit: 0.03,
  stopLoss: 0.05,
  // Intervalle de contrôle en secondes
  checkIntervalSec: 60,
  // Score minimal en fonction du mode de risque
  minScore: {
    conservateur: 16,
    equilibre: 12,
    aggressif: 8,
  },
});

// ==== [BLOC: HELPERS BINANCE] ===============================================
const symbolToBinance = (sym) => {
  // Permet BTC -> BTCUSDT, ETH -> ETHUSDT, etc.
  const s = (sym || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.endsWith("USDT") ? s : `${s}USDT`;
};

const fetchBinancePrice = async (symbol) => {
  const pair = symbolToBinance(symbol);
  const url = `${BINANCE_BASE}/api/v3/ticker/price?symbol=${pair}`;
  const { data } = await axios.get(url, { timeout: 7000 });
  const p = parseFloat(data?.price);
  return Number.isFinite(p) ? p : NaN;
};

const fetchBinancePricesMap = async (symbols) => {
  if (!symbols || symbols.length === 0) return {};
  const unique = Array.from(new Set(symbols));
  const results = await Promise.allSettled(unique.map((s) => fetchBinancePrice(s)));
  const map = {};
  unique.forEach((s, i) => {
    const v = results[i].status === "fulfilled" ? results[i].value : NaN;
    if (Number.isFinite(v)) map[s.toUpperCase()] = v;
  });
  return map;
};

// ==== [BLOC: REDUCTION/FORMAT] ==============================================
const nowIso = () => new Date().toISOString();

const round2 = (n) => Math.round(n * 100) / 100;

const ensureNumber = (v, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

// ==== [BLOC: PROVIDER] ======================================================
export const IATraderProvider = ({ children }) => {
  const { user } = useAuth();

  // ---- États IA trader ------------------------------------------------------
  const [iaName] = useState("IA Trader");
  const [iaStart, setIaStart] = useState(() => nowIso());
  const [iaCash, setIaCash] = useState(10000);
  const [iaPositions, setIaPositions] = useState([]); // {id, symbol, qty, buyPrice, buyAt, tp, sl}
  const [iaHistory, setIaHistory] = useState([]); // {id, type: 'BUY'|'SELL', symbol, qty, price, at, pnlUSD?, pnlPct?}
  const [currentPrices, setCurrentPrices] = useState({}); // {SYM: price}
  const [isRunning, setIsRunning] = useState(false);
  const [riskMode, setRiskMode] = useState("equilibre"); // 'conservateur' | 'equilibre' | 'aggressif'
  const [lastTickAt, setLastTickAt] = useState(null);
  const [log, setLog] = useState([]); // strings
  const [tickSec, setTickSec] = useState(DEFAULT_RULES.checkIntervalSec);

  // ---- Mémos ----------------------------------------------------------------
  const investedValue = useMemo(() => {
    return iaPositions.reduce((acc, p) => {
      const price = ensureNumber(currentPrices[p.symbol?.toUpperCase()], p.buyPrice);
      return acc + ensureNumber(p.qty, 0) * price;
    }, 0);
  }, [iaPositions, currentPrices]);

  const totalValue = useMemo(() => round2(iaCash + investedValue), [iaCash, investedValue]);

  // ==== [BLOC: LOGGING] =====================================================
  const pushLog = (msg) => {
    setLog((old) => {
      const next = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...old];
      // garde 500 lignes max
      return next.slice(0, 500);
    });
  };

  // ==== [BLOC: PERSISTENCE FIRESTORE] =======================================
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await loadIATrader(user.uid);
        if (data && mounted) {
          setIaStart(data.iaStart || nowIso());
          setIaCash(ensureNumber(data.iaCash, 10000));
          setIaPositions(Array.isArray(data.iaPositions) ? data.iaPositions : []);
          setIaHistory(Array.isArray(data.iaHistory) ? data.iaHistory : []);
          setRiskMode(data.riskMode || "equilibre");
          pushLog("Données IA Trader chargées depuis Firestore.");
        }
      } catch (e) {
        pushLog("⚠️ Échec chargement Firestore (IA Trader).");
      }
    };
    load();
    return () => (mounted = false);
  }, [user]);

  useEffect(() => {
    const save = async () => {
      if (!user) return;
      try {
        await saveIATrader(user.uid, {
          iaName,
          iaStart,
          iaCash,
          iaPositions,
          iaHistory,
          riskMode,
          lastTickAt,
        });
      } catch {
        // silencieux pour éviter spam
      }
    };
    save();
  }, [user, iaName, iaStart, iaCash, iaPositions, iaHistory, riskMode, lastTickAt]);

  // ==== [BLOC: PRIX COURANTS] ===============================================
  const updateIaPrices = async () => {
    const symbols = iaPositions.map((p) => (p.symbol || "").toUpperCase());
    if (symbols.length === 0) return;
    const map = await fetchBinancePricesMap(symbols);
    setCurrentPrices((prev) => ({ ...prev, ...map }));
  };

  // ==== [BLOC: BUY/SELL] ====================================================
  const sellPosition = (symbol, percent = 100, priceNow = null) => {
    symbol = (symbol || "").toUpperCase();
    setIaPositions((prev) => {
      const idx = prev.findIndex((p) => (p.symbol || "").toUpperCase() === symbol);
      if (idx < 0) return prev;

      const p = prev[idx];
      const price = ensureNumber(
        priceNow ?? currentPrices[symbol] ?? NaN,
        p.buyPrice
      );
      const sellQty =
        percent >= 100
          ? p.qty
          : round2((ensureNumber(p.qty, 0) * ensureNumber(percent, 100)) / 100);

      const cashDelta = round2(ensureNumber(price, 0) * sellQty);
      const newQty = round2(ensureNumber(p.qty, 0) - sellQty);

      setIaCash((c) => round2(c + cashDelta));
      setIaHistory((h) => [
        {
          id: `SELL-${Date.now()}`,
          type: "SELL",
          symbol,
          qty: sellQty,
          price,
          at: nowIso(),
          pnlUSD: round2((price - p.buyPrice) * sellQty),
          pnlPct: round2(((price - p.buyPrice) / p.buyPrice) * 100),
        },
        ...h,
      ]);

      const updated = [...prev];
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        updated[idx] = { ...p, qty: newQty };
      }
      pushLog(`Vente ${percent}% ${symbol} @ ${price}`);
      return updated;
    });
  };

  const buyPosition = async (symbol, forcedPrice = null) => {
    symbol = (symbol || "").toUpperCase();
    const price =
      ensureNumber(forcedPrice ?? (await fetchBinancePrice(symbol)), NaN);
    if (!Number.isFinite(price) || price <= 0) {
      pushLog(`⚠️ Prix invalide pour ${symbol}, achat annulé.`);
      return;
    }

    const investUSD = round2(iaCash * DEFAULT_RULES.buyFraction);
    if (investUSD <= 0) {
      pushLog("⚠️ Cash insuffisant.");
      return;
    }
    const qty = round2(investUSD / price);
    if (qty <= 0) {
      pushLog("⚠️ Quantité nulle (prix trop élevé ou cash trop faible).");
      return;
    }

    const newCash = round2(iaCash - investUSD);
    const tp = round2(price * (1 + DEFAULT_RULES.takeProfit));
    const sl = round2(price * (1 - DEFAULT_RULES.stopLoss));

    setIaCash(newCash);
    setIaPositions((prev) => [
      {
        id: `BUY-${Date.now()}`,
        symbol,
        qty,
        buyPrice: price,
        buyAt: nowIso(),
        tp,
        sl,
      },
      ...prev,
    ]);
    setIaHistory((h) => [
      {
        id: `BUY-${Date.now()}`,
        type: "BUY",
        symbol,
        qty,
        price,
        at: nowIso(),
      },
      ...h,
    ]);
    setCurrentPrices((prev) => ({ ...prev, [symbol]: price }));
    pushLog(`Achat ${symbol} qty ${qty} @ ${price} | TP ${tp} / SL ${sl}`);
  };

  // ==== [BLOC: CHECK POSITIONS - TP/SL] =====================================
  const checkPositions = async () => {
    if (iaPositions.length === 0) return;
    const map = await fetchBinancePricesMap(iaPositions.map((p) => p.symbol));
    if (Object.keys(map).length === 0) return;

    setCurrentPrices((prev) => ({ ...prev, ...map }));

    // Boucle de contrôle TP/SL
    for (const p of iaPositions) {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNumber(map[sym], NaN);
      if (!Number.isFinite(price)) continue;

      // TP
      if (price >= ensureNumber(p.tp, Infinity)) {
        sellPosition(sym, 100, price);
        pushLog(`✅ TP touché sur ${sym} @ ${price}`);
        continue;
      }
      // SL
      if (price <= ensureNumber(p.sl, 0)) {
        sellPosition(sym, 100, price);
        pushLog(`🛑 SL touché sur ${sym} @ ${price}`);
        continue;
      }
    }
  };

  // ==== [BLOC: AUTO-TRADE SUR SIGNAUX] ======================================
  const fetchLatestSignals = async () => {
    const api = getApiBase();
    const url = `${api}/utcapp/signals`;
    const { data } = await axios.get(url, { timeout: 8000 });
    return Array.isArray(data) ? data : [];
  };

  const scoreThreshold = useMemo(
    () => DEFAULT_RULES.minScore[riskMode] ?? DEFAULT_RULES.minScore.equilibre,
    [riskMode]
  );

  const handleSignals = async () => {
    try {
      const sigs = await fetchLatestSignals();
      if (!sigs.length) return;

      // On prend les plus récents en priorité
      for (const s of sigs.slice(0, 10)) {
        const action = (s.action || s.type || "").toUpperCase(); // BUY / SELL / INFO
        const symbol = (s.symbol || s.pair || "").replace("/USDT", "").toUpperCase();
        const score = ensureNumber(s.score, 0);

        if (!symbol || !action) continue;

        // BUY auto si score >= seuil
        if (action === "BUY" && score >= scoreThreshold) {
          await buyPosition(symbol);
        }

        // SELL auto si position ouverte
        if (action === "SELL") {
          const pos = iaPositions.find(
            (p) => (p.symbol || "").toUpperCase() === symbol
          );
          if (pos) {
            const pNow = await fetchBinancePrice(symbol);
            sellPosition(symbol, 100, pNow);
          }
        }
      }
    } catch {
      // silencieux
    }
  };

  // ==== [BLOC: TICK LOOP] ===================================================
  useEffect(() => {
    if (!isRunning) return;
    let stopped = false;

    const tick = async () => {
      try {
        await updateIaPrices();
        await checkPositions();
        await handleSignals();
        setLastTickAt(nowIso());
      } catch {
        // silencieux
      }
      if (!stopped) {
        timer = setTimeout(tick, Math.max(5, tickSec) * 1000);
      }
    };

    let timer = setTimeout(tick, 100); // démarrage rapide
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [isRunning, tickSec, iaPositions, riskMode]); // iaPositions pour pouvoir ajuster TP/SL rapidement

  // ==== [BLOC: ACTIONS PUBLIQUES] ===========================================
  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      pushLog("▶️ IA Trader démarré.");
    }
  };

  const stop = () => {
    if (isRunning) {
      setIsRunning(false);
      pushLog("⏸️ IA Trader arrêté.");
    }
  };

  const resetIATrader = () => {
    setIaStart(nowIso());
    setIaCash(10000);
    setIaPositions([]);
    setIaHistory([]);
    setCurrentPrices({});
    pushLog("♻️ IA Trader réinitialisé (cash 10 000$).");
  };

  // ==== [BLOC: CONTEXTE VALUE] ==============================================
  const value = useMemo(
    () => ({
      // état
      iaName,
      iaStart,
      iaCash,
      iaPositions,
      iaHistory,
      currentPrices,
      isRunning,
      riskMode,
      lastTickAt,
      tickSec,
      totalValue,

      // actions
      setRiskMode,
      setTickSec,
      start,
      stop,
      resetIATrader,
      buyPosition,
      sellPosition,
      updateIaPrices,
    }),
    [
      iaName,
      iaStart,
      iaCash,
      iaPositions,
      iaHistory,
      currentPrices,
      isRunning,
      riskMode,
      lastTickAt,
      tickSec,
      totalValue,
    ]
  );

  return (
    <IATraderContext.Provider value={value}>{children}</IATraderContext.Provider>
  );
};

// ==== [BLOC: EXPORT HOOK] ===================================================
export const useIATrader = () => useContext(IATraderContext);

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Suppression des imports React en double (erreur "already been declared").
// - Bascule complète sur BINANCE (fetch des prix via /api/v3/ticker/price).
// - Ajout d’un loop IA autonome: update prix -> check TP/SL -> lecture signaux -> exécution.
// - Achat en USD (1/3 du cash), quantité auto, TP 3% / SL 5% conformément aux règles.
// - Ventes partielles/complètes supportées, historique enrichi (pnl USD/%).
// - Persistance Firestore conservée (loadIATrader/saveIATrader).
// - Exposition d’API claires: start/stop/reset, buyPosition, sellPosition, updateIaPrices.
// - Annotations de blocs ajoutées pour faciliter les futures modifications.