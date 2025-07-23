// src/pages/IATrader.jsx
import React, { useState, useEffect, useRef } from "react";
import fetchPrices from "../utils/fetchPrices";
import "../styles/IATrader.css"; // CSS pour le thème sombre

const BUY_THRESHOLD = 0.006;  // 0.6 %
const SELL_THRESHOLD = 0.006; // 0.6 %
const STARTING_BALANCE = 10000;

const IATrader = () => {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [positions, setPositions] = useState({});
  const [history, setHistory] = useState([]);
  const [nextBuys, setNextBuys] = useState([]);
  const [nextSells, setNextSells] = useState([]);
  const lastPricesRef = useRef({});

  useEffect(() => {
    const runStrategy = async () => {
      const currentPrices = await fetchPrices();
      const upcomingBuys = [];
      const upcomingSells = [];

      Object.entries(currentPrices).forEach(([sym, price]) => {
        const last = lastPricesRef.current[sym];
        if (last == null) return;
        const change = (price - last) / last;

        // repérer signaux
        if (change <= -BUY_THRESHOLD) upcomingBuys.push(sym);
        if (change >= SELL_THRESHOLD && positions[sym]) upcomingSells.push(sym);

        // exécuter
        if (change <= -BUY_THRESHOLD) {
          const amountUsd = balance * 0.1;
          const qty = amountUsd / price;
          setBalance(b => b - amountUsd);
          setPositions(p => ({
            ...p,
            [sym]: { amount: (p[sym]?.amount || 0) + qty, entryPrice: price }
          }));
          setHistory(h => [
            ...h,
            {
              type: "buy", symbol: sym, price, amountUsd,
              date: new Date().toLocaleString(),
              reason: `Variation ${-(change*100).toFixed(2)} %`
            }
          ]);
        }
        if (change >= SELL_THRESHOLD && positions[sym]) {
          const pos = positions[sym];
          const amountUsd = pos.amount * price;
          setBalance(b => b + amountUsd);
          setPositions(p => {
            const c = { ...p }; delete c[sym]; return c;
          });
          setHistory(h => [
            ...h,
            {
              type: "sell", symbol: sym, price, amountUsd,
              date: new Date().toLocaleString(),
              reason: `Variation +${(change*100).toFixed(2)} %`
            }
          ]);
        }
      });

      lastPricesRef.current = currentPrices;
      setNextBuys(upcomingBuys);
      setNextSells(upcomingSells);
    };

    // initialiser les prix
    (async () => {
      lastPricesRef.current = await fetchPrices();
    })();

    const iv = setInterval(runStrategy, 60000);
    return () => clearInterval(iv);
  }, [balance, positions]);

  return (
    <div className="ia-trader-container">
      <h1>🤖 IA Trader</h1>

      <div className="summary">
        <div>Bilan : ${balance.toFixed(2)}</div>
        <div>Performance : {(((balance - STARTING_BALANCE) / STARTING_BALANCE) * 100).toFixed(2)} %</div>
      </div>

      <table className="ia-table">
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Action</th>
            <th>Quantité</th>
            <th>Prix d’entrée</th>
            <th>Date / Heure</th>
            <th>Raison</th>
          </tr>
        </thead>
        <tbody>
          {history.map((tx, i) => {
            const isBuy = tx.type === "buy";
            const isUpcoming = isBuy
              ? nextBuys.includes(tx.symbol)
              : nextSells.includes(tx.symbol);
            return (
              <tr key={i} className={isUpcoming ? (isBuy ? "upcoming-buy" : "upcoming-sell") : ""}>
                <td>{tx.symbol}</td>
                <td>{isBuy ? "🔵 Achat" : "🔴 Vente"}</td>
                <td>{(tx.amountUsd / tx.price).toFixed(4)}</td>
                <td>${tx.price.toFixed(2)}</td>
                <td>{tx.date}</td>
                <td>{tx.reason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IATrader;