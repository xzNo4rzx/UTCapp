import React, { createContext, useEffect, useState } from "react";
import fetchPrices from "../utils/fetchPrices";

export const IATraderContext = createContext();

export const IATraderProvider = ({ children }) => {
  const [iaName] = useState("IA-Trader");

  const [iaCash, setIaCash] = useState(() => {
    const stored = localStorage.getItem("ia-cash");
    return stored ? parseFloat(stored) : 10000;
  });

  const [iaPositions, setIaPositions] = useState(() => {
    const stored = localStorage.getItem("ia-positions");
    return stored ? JSON.parse(stored) : [];
  });

  const [iaHistory, setIaHistory] = useState(() => {
    const stored = localStorage.getItem("ia-history");
    return stored ? JSON.parse(stored) : [];
  });

  const [iaCurrentPrices, setIaCurrentPrices] = useState(() => {
    const stored = localStorage.getItem("ia-prices");
    return stored ? JSON.parse(stored) : {};
  });

  const [iaStart] = useState(() => {
    const stored = localStorage.getItem("ia-start");
    if (stored) return stored;
    const now = new Date().toISOString();
    localStorage.setItem("ia-start", now);
    return now;
  });

  useEffect(() => localStorage.setItem("ia-cash", iaCash), [iaCash]);
  useEffect(() => localStorage.setItem("ia-positions", JSON.stringify(iaPositions)), [iaPositions]);
  useEffect(() => localStorage.setItem("ia-history", JSON.stringify(iaHistory)), [iaHistory]);
  useEffect(() => localStorage.setItem("ia-prices", JSON.stringify(iaCurrentPrices)), [iaCurrentPrices]);

  const updateIaPrices = async () => {
    try {
      const { top5Up, top5Down, rest } = await fetchPrices();
      const merged = [...top5Up, ...top5Down, ...rest];
      const prices = {};
      merged.forEach((c) => {
        prices[c.symbol] = c.currentPrice;
      });
      setIaCurrentPrices(prices);

      const now = Date.now();
      const lastBuy = iaHistory.find((t) => t.type === "buy");
      const lastBuyTime = lastBuy ? new Date(lastBuy.date).getTime() : 0;

      if (iaPositions.length === 0 && now - lastBuyTime > 5 * 60 * 1000) {
        const candidate = top5Up[0];
        if (candidate && iaCash >= 100) {
          iaBuy(candidate.symbol, candidate.currentPrice, 100);
        }
      }

      checkTP_SL(prices);
    } catch (err) {
      console.error("Erreur update IA :", err);
    }
  };

  const iaBuy = (symbol, price, usdAmount) => {
    if (usdAmount > iaCash) return;
    const quantity = usdAmount / price;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace(/[-T:]/g, "").slice(2);
    const stored = JSON.parse(localStorage.getItem("ia-nid") || "[]");
    const currentLetter = stored.length < 9 ? "A" : "B";
    const currentIndex = stored.length % 9 + 1;
    const paddedIndex = (stored.length + 1).toString().padStart(3, "0");
    const id = `ia-${dateStr}-${paddedIndex}${currentLetter}${currentIndex}`;
    localStorage.setItem("ia-nid", JSON.stringify([...stored, id]));

    setIaPositions((prev) => [
      ...prev,
      {
        id,
        symbol,
        quantity,
        buyPrice: price,
        date: now.toISOString(),
        tpPercent: 2.5,
        slPercent: 5.0,
      },
    ]);

    setIaCash((c) => c - usdAmount);

    setIaHistory((prev) => [
      {
        id,
        type: "buy",
        symbol,
        quantity,
        buyPrice: price,
        investment: usdAmount,
        date: now.toISOString(),
      },
      ...prev,
    ]);
  };

  const iaSell = (id, quantity, price) => {
    const pos = iaPositions.find((p) => p.id === id);
    if (!pos || quantity > pos.quantity) return;

    const proceeds = quantity * price;
    const cost = quantity * pos.buyPrice;
    const profit = proceeds - cost;

    setIaPositions((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: p.quantity - quantity } : p
        )
        .filter((p) => p.quantity > 0)
    );

    setIaCash((c) => c + proceeds);

    setIaHistory((prev) => [
      {
        id: Date.now(),
        type: "sell",
        symbol: pos.symbol,
        quantity,
        buyPrice: pos.buyPrice,
        sellPrice: price,
        profit,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const checkTP_SL = (prices) => {
    iaPositions.forEach((p) => {
      const curr = prices[p.symbol];
      if (!curr) return;
      const perf = (curr - p.buyPrice) / p.buyPrice;
      const tp = p.tpPercent ?? 2.5;
      const sl = p.slPercent ?? 5.0;
      if (perf >= tp / 100 || perf <= -sl / 100) {
        iaSell(p.id, p.quantity, curr);
      }
    });
  };

  const iaTotalProfit =
    iaHistory
      .filter((t) => t.type === "sell")
      .reduce((sum, t) => sum + t.profit, 0) +
    iaPositions.reduce((sum, p) => {
      const curr = iaCurrentPrices[p.symbol] ?? 0;
      return sum + p.quantity * (curr - p.buyPrice);
    }, 0);

  const iaTotalProfitPercent = iaTotalProfit / 100;

  const resetIATrader = () => {
  const now = new Date().toISOString();
  const ptResult = iaCash + iaPositions.reduce((sum, p) => {
    const curr = iaCurrentPrices[p.symbol] ?? p.buyPrice;
    return sum + p.quantity * curr;
  }, 0);
  const pct = ((ptResult - 10000) / 10000) * 100;

  const history = JSON.parse(localStorage.getItem("ia-pt-history") || "[]");
  const newEntry = {
    name: iaName,
    start: iaStart,
    end: now,
    result: ptResult.toFixed(2),
    percent: pct.toFixed(2),
  };
  localStorage.setItem("ia-pt-history", JSON.stringify([newEntry, ...history]));

  localStorage.removeItem("ia-cash");
  localStorage.removeItem("ia-positions");
  localStorage.removeItem("ia-history");
  localStorage.removeItem("ia-prices");
  localStorage.removeItem("ia-start");
  localStorage.removeItem("ia-nid");

  window.location.reload(); // recharge pour tout réinitialiser
};

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
      }}
    >
      {children}
    </IATraderContext.Provider>
  );
};