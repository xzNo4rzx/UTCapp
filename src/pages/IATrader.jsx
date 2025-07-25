// src/pages/IATrader.jsx
import React, { useContext } from "react";
import { IATraderContext } from "../context/IATraderContext";

const IATrader = () => {
  const {
    iaName,
    iaStart,
    iaCash,
    iaPositions = [],
    iaHistory = [],
    iaCurrentPrices = {},
    iaTotalProfit,
    iaTotalProfitPercent,
    updateIaPrices,
  } = useContext(IATraderContext);

  const fmt = (v) => (v !== undefined ? Number(v).toFixed(2) : "—");

  const handleUpdate = () => {
    updateIaPrices();
  };

  const currentValue = iaPositions.reduce((sum, p) => {
    const curr = iaCurrentPrices[p.symbol] ?? p.buyPrice;
    return sum + p.quantity * curr;
  }, 0);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#eee", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>🤖 IA Trader</h1>
      <h2 style={{ color: "#aaa" }}>{iaName}</h2>

      {/* Bilan */}
      <section style={{ margin: "2rem 0", backgroundColor: "#1e1e1e", padding: "1rem", borderRadius: "6px" }}>
        <h3>Rendement IA</h3>
        <p>Date de démarrage : {new Date(iaStart).toLocaleString()}</p>
        <p>Cash disponible : ${fmt(iaCash)}</p>
        <p>Valeur actuelle des positions : ${fmt(currentValue)}</p>
        <p>Rendement total : <strong style={{ color: iaTotalProfit >= 0 ? "lightgreen" : "salmon" }}>
          ${fmt(iaTotalProfit)} ({fmt(iaTotalProfitPercent)}%)
        </strong></p>
        <button onClick={handleUpdate} style={{ marginTop: "1rem", padding: "8px 16px", backgroundColor: "#007bff", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer" }}>
          🔄 UPDATE PRICES NOW
        </button>
      </section>

      {/* Positions IA */}
      <section>
        <h3>Positions ouvertes IA</h3>
        {iaPositions.length === 0 ? (
          <p>Aucune position.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr>
                  <th>Crypto</th>
                  <th>Qté</th>
                  <th>Achat ($)</th>
                  <th>Prix actuel</th>
                  <th>Évolution</th>
                </tr>
              </thead>
              <tbody>
                {iaPositions.map((p, i) => {
                  const curr = iaCurrentPrices[p.symbol] ?? p.buyPrice;
                  const pnl = (curr - p.buyPrice) * p.quantity;
                  return (
                    <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                      <td style={{ padding: "8px" }}>{p.symbol}</td>
                      <td style={{ padding: "8px" }}>{p.quantity.toFixed(6)}</td>
                      <td style={{ padding: "8px" }}>${p.buyPrice.toFixed(2)}</td>
                      <td style={{ padding: "8px" }}>${curr.toFixed(2)}</td>
                      <td style={{ padding: "8px", color: pnl >= 0 ? "lightgreen" : "salmon" }}>
                        ${pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Historique IA */}
      <section style={{ marginTop: "2rem" }}>
        <h3>Historique IA</h3>
        {iaHistory.length === 0 ? (
          <p>Aucune opération.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Crypto</th>
                  <th>Qté</th>
                  <th>Montant ($)</th>
                </tr>
              </thead>
              <tbody>
                {iaHistory.map((h, i) => (
                  <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                    <td style={{ padding: "8px" }}>{new Date(h.date).toLocaleString()}</td>
                    <td style={{ padding: "8px" }}>{h.type}</td>
                    <td style={{ padding: "8px" }}>{h.symbol}</td>
                    <td style={{ padding: "8px" }}>{h.quantity.toFixed(6)}</td>
                    <td style={{ padding: "8px" }}>${h.amountUsd ? fmt(h.amountUsd) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default IATrader;