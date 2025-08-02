import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { loadIATrader, saveIATrader } from "../utils/firestoreIATrader";

export const IATraderContext = createContext();

export const IATraderProvider = ({ children }) => {
  const { user } = useAuth();

  // ⚙️ États internes
  const [iaName] = useState("IA Trader");
  const [iaStart, setIaStart] = useState(() => new Date().toISOString());
  const [iaCash, setIaCash] = useState(10000);
  const [iaPositions, setIaPositions] = useState([]);
  const [iaHistory, setIaHistory] = useState([]);
  const [iaCurrentPrices, setIaCurrentPrices] = useState({});

  // 🔁 Chargement Firestore lors de la connexion
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const data = await loadIATrader(user.uid);
      if (data) {
        setIaStart(data.iaStart || new Date().toISOString());
        setIaCash(data.iaCash || 10000);
        setIaPositions(data.iaPositions || []);
        setIaHistory(data.iaHistory || []);
      }
    };
    fetch();
  }, [user]);

  // 💾 Sauvegarde Firestore à chaque modification
  useEffect(() => {
    if (!user) return;
    const save = async () => {
      await saveIATrader(user.uid, {
        iaStart,
        iaCash,
        iaPositions,
        iaHistory,
        updatedAt: new Date().toISOString(),
      });
    };
    save();
  }, [user, iaStart, iaCash, iaPositions, iaHistory]);

  // 🔄 Récupération des prix (CryptoCompare + fallback Binance)
  const updateIaPrices = async () => {
    const symbols = iaPositions.map((p) => p.symbol);
    if (symbols.length === 0) return;

    try {
      const { data } = await axios.get("https://min-api.cryptocompare.com/data/pricemulti", {
        params: {
          fsyms: symbols.join(","),
          tsyms: "USD",
          api_key: import.meta.env.VITE_CRYPTOCOMPARE_API_KEY,
        },
      });

      const prices = {};

      for (const sym of symbols) {
        const usd = data?.[sym]?.USD;
        if (typeof usd === "number" && usd > 0) {
          prices[sym] = usd;
        } else {
          console.warn(`⛔️ CryptoCompare a échoué pour ${sym}, fallback Binance...`);
          try {
            const binanceSym = sym.toUpperCase() + "USDT";
            const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSym}`);
            const fallbackPrice = parseFloat(res.data?.price);
            if (!isNaN(fallbackPrice) && fallbackPrice > 0) {
              prices[sym] = fallbackPrice;
            } else {
              console.warn(`⚠️ Binance a échoué aussi pour ${sym}`);
            }
          } catch (err) {
            console.error(`🔥 Fallback Binance échoué pour ${sym}`, err.message);
          }
        }
      }

      setIaCurrentPrices((prev) => ({ ...prev, ...prices }));
    } catch (err) {
      console.error("Erreur CryptoCompare (IA Trader) :", err);
    }
  };

  // 🧨 Réinitialisation complète
  const resetIATrader = () => {
    const nowIso = new Date().toISOString();
    setIaStart(nowIso);
    setIaCash(10000);
    setIaPositions([]);
    setIaHistory([]);
    setIaCurrentPrices({});
  };

  // 📊 Calculs
  const investedAmount = useMemo(
    () => iaPositions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0),
    [iaPositions]
  );

  const iaTotalProfit = useMemo(() => {
    const closed = iaHistory
      .filter((t) => t.type === "sell")
      .reduce((acc, t) => acc + t.profit, 0);
    const open = iaPositions.reduce((acc, p) => {
      const curr = iaCurrentPrices[p.symbol] ?? p.buyPrice;
      return acc + p.quantity * (curr - p.buyPrice);
    }, 0);
    return closed + open;
  }, [iaHistory, iaPositions, iaCurrentPrices]);

  const iaTotalProfitPercent = useMemo(() => (iaTotalProfit / 10000) * 100, [iaTotalProfit]);

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