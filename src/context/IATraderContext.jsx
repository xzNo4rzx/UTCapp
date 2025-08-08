// FICHIER: ~/Documents/utc-app-full/src/context/IATraderContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useEffect, useState, useMemo, useContext } from "react";
import { useAuth } from "./AuthContext";
import { loadIATrader, saveIATrader } from "../utils/firestoreIATrader";
import {
  apiGetPrice,
  apiGetPrices,
  apiGetKlines,
  apiTickSignals,
  apiLatestSignals,
} from "../utils/api";

// ==== [BLOC: CONTEXTE] ======================================================
export const IATraderContext = createContext();

// ==== [BLOC: CONSTANTES] ====================================================
const DEFAULT_RULES = Object.freeze({
  buyFraction: 1 / 3,     // investit 1/3 du cash par BUY
  takeProfit: 0.03,       // TP 3%
  stopLoss: 0.05,         // SL 5%
  checkIntervalSec: 60,   // tick loop
  minScore: {
    conservateur: 16,
    equilibre: 12,
    aggressif: 8,
  },
});

// ==== [BLOC: HELPERS] =======================================================
const nowIso = () => new Date().toISOString();
const round2 = (n) => Math.round(n * 100) / 100;
const ensureNumber = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);

// ==== [BLOC: BACKEND PRICES HELPERS] =======================================
const fetchBackendPrice = async (symbol) => {
  const s = String(symbol || "").toUpperCase();
  const { price } = await apiGetPrice(s);
  const p = Number(price);
  return Number.isFinite(p) ? p : NaN;
};

const fetchBackendPricesMap = async (symbols) => {
  if (!symbols || symbols.length === 0) return {};
  const uniq = Array.from(new Set(symbols.map((x) => String(x || "").toUpperCase())));
  const { prices: mp = {} } = await apiGetPrices(uniq);
  const out = {};
  for (const s of uniq) {
    // accepte clés "BTC" ou "BTCUSDT"
    const v = Number(mp?.[s] ?? mp?.[`${s}USDT`]);
    if (Number.isFinite(v)) out[s] = v;
  }
  return out;
};

// ==== [BLOC: PROVIDER] ======================================================
export const IATraderProvider = ({ children }) => {
  const { user } = useAuth();

  // ---- [BLOC: STATES] ------------------------------------------------------
  const [iaName] = useState("IA Trader");
  const [iaStart, setIaStart] = useState(() => nowIso());
  const [iaCash, setIaCash] = useState(10000);
  const [iaPositions, setIaPositions] = useState([]); // {id,symbol,qty,buyPrice,buyAt,tp,sl}
  const [iaHistory, setIaHistory] = useState([]);     // {id,type:'BUY'|'SELL',symbol,qty,price,at,pnlUSD?,pnlPct?}
  const [currentPrices, setCurrentPrices] = useState({}); // {SYM: price}
  const [isRunning, setIsRunning] = useState(false);
  const [riskMode, setRiskMode] = useState("equilibre"); // 'conservateur'|'equilibre'|'aggressif'
  const [lastTickAt, setLastTickAt] = useState(null);
  const [log, setLog] = useState([]);
  const [tickSec, setTickSec] = useState(DEFAULT_RULES.checkIntervalSec);

  // ---- [BLOC: MEMOS] -------------------------------------------------------
  const investedValue = useMemo(() => {
    return iaPositions.reduce((acc, p) => {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNumber(currentPrices[sym], p.buyPrice);
      return acc + ensureNumber(p.qty, 0) * price;
    }, 0);
  }, [iaPositions, currentPrices]);

  const totalValue = useMemo(() => round2(iaCash + investedValue), [iaCash, investedValue]);

  // ---- [BLOC: LOG] ---------------------------------------------------------
  const pushLog = (msg) => {
    setLog((old) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...old].slice(0, 500));
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
      } catch {
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
        // silencieux
      }
    };
    save();
  }, [user, iaName, iaStart, iaCash, iaPositions, iaHistory, riskMode, lastTickAt]);

  // ==== [BLOC: PRIX COURANTS] ===============================================
  const updateIaPrices = async () => {
    const symbols = iaPositions.map((p) => (p.symbol || "").toUpperCase());
    if (symbols.length === 0) return;
    const map = await fetchBackendPricesMap(symbols);
    setCurrentPrices((prev) => ({ ...prev, ...map }));
  };

  // ==== [BLOC: BUY/SELL] ====================================================
  const sellPosition = (symbol, percent = 100, priceNow = null) => {
    symbol = (symbol || "").toUpperCase();
    setIaPositions((prev) => {
      const idx = prev.findIndex((p) => (p.symbol || "").toUpperCase() === symbol);
      if (idx < 0) return prev;

      const p = prev[idx];
      const price = ensureNumber(priceNow ?? currentPrices[symbol] ?? NaN, p.buyPrice);
      const sellQty =
        percent >= 100 ? p.qty : round2((ensureNumber(p.qty, 0) * ensureNumber(percent, 100)) / 100);

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
      if (newQty <= 0) updated.splice(idx, 1);
      else updated[idx] = { ...p, qty: newQty };

      pushLog(`Vente ${percent}% ${symbol} @ ${price}`);
      return updated;
    });
  };

  const buyPosition = async (symbol, forcedPrice = null) => {
    symbol = (symbol || "").toUpperCase();
    const price = ensureNumber(forcedPrice ?? (await fetchBackendPrice(symbol)), NaN);
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
    const map = await fetchBackendPricesMap(iaPositions.map((p) => p.symbol));
    if (Object.keys(map).length === 0) return;

    setCurrentPrices((prev) => ({ ...prev, ...map }));

    for (const p of iaPositions) {
      const sym = (p.symbol || "").toUpperCase();
      const price = ensureNumber(map[sym], NaN);
      if (!Number.isFinite(price)) continue;

      if (price >= ensureNumber(p.tp, Infinity)) {
        sellPosition(sym, 100, price);
        pushLog(`✅ TP touché sur ${sym} @ ${price}`);
        continue;
      }
      if (price <= ensureNumber(p.sl, 0)) {
        sellPosition(sym, 100, price);
        pushLog(`🛑 SL touché sur ${sym} @ ${price}`);
        continue;
      }
    }
  };

  // ==== [BLOC: AUTO-TRADE SUR SIGNAUX] ======================================
  const scoreThreshold = useMemo(
    () => DEFAULT_RULES.minScore[riskMode] ?? DEFAULT_RULES.minScore.equilibre,
    [riskMode]
  );

  const fetchLatestSignals = async () => {
    const arr = await apiTickSignals();
    return Array.isArray(arr) ? arr : [];
  };

  const handleSignals = async () => {
    try {
      const sigs = await fetchLatestSignals();
      if (!sigs.length) return;

      for (const s of sigs.slice(0, 10)) {
        const action = (s.action || s.type || "").toUpperCase(); // BUY / SELL / INFO
        const symbol = (s.symbol || s.pair || "").replace("/USDT", "").toUpperCase();
        const score = ensureNumber(s.score, 0);

        if (!symbol || !action) continue;

        if (action === "BUY" && score >= scoreThreshold) {
          await buyPosition(symbol);
        }

        if (action === "SELL") {
          const pos = iaPositions.find((p) => (p.symbol || "").toUpperCase() === symbol);
          if (pos) {
            const pNow = await fetchBackendPrice(symbol);
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

    let timer = setTimeout(tick, 100);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [isRunning, tickSec, iaPositions, riskMode]);

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

  return <IATraderContext.Provider value={value}>{children}</IATraderContext.Provider>;
};

// ==== [BLOC: EXPORT HOOK] ===================================================
export const useIATrader = () => useContext(IATraderContext);

// ==== [BLOC: EXPORTS] =======================================================
export default IATraderContext;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Restauration d’un IATraderContext complet (provider + exports nommé & default).
// - Routage 100% via backend (utils/api), plus d’appels directs Binance (CORS).
// - Acceptation des clés de prix 'BTC' et 'BTCUSDT' dans la map de retour.
// - Tick loop IA : update prix -> check TP/SL -> signaux, avec persistance Firestore.
// - Annotations de blocs ajoutées pour repérage visuel.
