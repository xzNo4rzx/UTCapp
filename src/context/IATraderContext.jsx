// src/context/IATraderContext.js

import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

export const IATraderContext = createContext();

export const IATraderProvider = ({ children }) => {
  // 1) Nom fixe de l'IA
  const [iaName] = useState("IA Trader");

  // 2) Date de démarrage, chargée une seule fois depuis localStorage ou initialisée maintenant
  const [iaStart, setIaStart] = useState(() => {
    const stored = localStorage.getItem("iaStartDate");
    return stored || new Date().toISOString();
  });

  // 3) Cash initial
  const [iaCash, setIaCash] = useState(() => {
    const stored = localStorage.getItem("iaCash");
    return stored ? parseFloat(stored) : 10000;
  });

  // 4) Positions ouvertes
  const [iaPositions, setIaPositions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("iaPositions")) || [];
    } catch {
      return [];
    }
  });

  // 5) Historique des trades
  const [iaHistory, setIaHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("iaHistory")) || [];
    } catch {
      return [];
    }
  });

  // 6) Prix courants pour les positions
  const [iaCurrentPrices, setIaCurrentPrices] = useState({});

  // —————— Persistance dans localStorage ——————
  useEffect(() => {
    localStorage.setItem("iaStartDate", iaStart);
  }, [iaStart]);

  useEffect(() => {
    localStorage.setItem("iaCash", iaCash.toString());
  }, [iaCash]);

  useEffect(() => {
    localStorage.setItem("iaPositions", JSON.stringify(iaPositions));
  }, [iaPositions]);

  useEffect(() => {
    localStorage.setItem("iaHistory", JSON.stringify(iaHistory));
  }, [iaHistory]);

  // —————— Mise à jour des prix via CryptoCompare ——————
  const updateIaPrices = async () => {
    const symbols = iaPositions.map((p) => p.symbol);
    if (symbols.length === 0) return;
    try {
      const { data } = await axios.get(
        "https://min-api.cryptocompare.com/data/pricemulti",
        {
          params: {
            fsyms: symbols.join(","),
            tsyms: "USD",
            api_key: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY,
          },
        }
      );
      const prices = {};
      for (const sym of symbols) {
        prices[sym] = data[sym]?.USD ?? null;
      }
      setIaCurrentPrices(prices);
    } catch (err) {
      console.error("Erreur updateIaPrices :", err);
    }
  };

  // —————— Réinitialisation complète de l’IA Trader ——————
  const resetIATrader = () => {
    const nowIso = new Date().toISOString();
    setIaStart(nowIso);
    setIaCash(10000);
    setIaPositions([]);
    setIaHistory([]);
    setIaCurrentPrices({});
  };

  // —————— Calcul du profit total et % ——————
  const investedAmount = useMemo(
    () =>
      iaPositions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0),
    [iaPositions]
  );

  const iaTotalProfit = useMemo(() => {
    const closed = iaHistory
      .filter((t) => t.type === "sell")
      .reduce((acc, t) => acc + t.profit, 0);
    const open = iaPositions.reduce((acc, p) => {
      const curr = iaCurrentPrices[p.symbol] ?? 0;
      return acc + p.quantity * (curr - p.buyPrice);
    }, 0);
    return closed + open;
  }, [iaHistory, iaPositions, iaCurrentPrices]);

  const iaTotalProfitPercent = useMemo(() => {
    return (iaTotalProfit / 10000) * 100;
  }, [iaTotalProfit]);

  return (
    <IATraderContext.Provider
      value={{
        iaName,
        iaStart,
        iaCash,
        iaPositions,
        iaHistory,
        iaCurrentPrices,
        iaTotalProfit,
        iaTotalProfitPercent,
        updateIaPrices,
        resetIATrader,
      }}
    >
      {children}
    </IATraderContext.Provider>
  );
};