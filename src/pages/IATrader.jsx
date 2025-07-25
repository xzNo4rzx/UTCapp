import React, { useContext, useState } from "react";
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

  const [startDate] = useState(() => new Date(iaStart));

  const fmt = (n) => Number(n).toFixed(2);

  const investedAmount = iaPositions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0);
  const activePositionsCount = iaPositions.length;
  const totalTrades = iaHistory.filter((t) => t.type === "buy").length;
  const positiveTrades = iaHistory.filter((t) => t.type === "sell" && t.profit > 0).length;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>🤖 IA Trader</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h2 style={{ color: "#aaa" }}>{iaName} | 🕒 Début du PT : {startDate.toLocaleString()}</h2>
        <button
          onClick={updateIaPrices}
          style={{
            padding: "6px 12px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 UPDATE PRICES NOW
        </button>
      </div>

      {/* Bilan */}
      <section style={{ backgroundColor: "#1e1e1e", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>📊 Bilan</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div>💹 Bilan global</div>
          <div>💼 Solde total : ${fmt(iaCash + investedAmount)}</div>
          <div>💰 Cash disponible : ${fmt(iaCash)}</div>
          <div>📈 Investi : ${fmt(investedAmount)}</div>
          <div>📊 Positions ouvertes : {activePositionsCount}</div>
          <div>🔁 Nombre de trades : {totalTrades}</div>
          <div>✅ Trades positifs : {positiveTrades} / {totalTrades}</div>
          <div style={{
            marginLeft: "auto",
            fontWeight: "bold",
            fontSize: "1.1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#222",
            borderRadius: "6px",
            color: iaTotalProfit >= 0 ? "lightgreen" : "salmon",
          }}>
            📈 Rendement total : ${fmt(iaTotalProfit)} ({fmt(iaTotalProfitPercent)}%)
          </div>
        </div>
      </section>

      {/* Positions en cours */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📌 Positions en cours</h3>
        {iaPositions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr>
                  <th>Crypto</th>
                  <th>Date & Heure</th>
                  <th>ID</th>
                  <th>Investi $</th>
                  <th>Prix achat</th>
                  <th>Prix actuel</th>
                  <th>Résultat $</th>
                  <th>Résultat %</th>
                </tr>
              </thead>
              <tbody>
                {iaPositions.map((p, i) => {
                  const curr = iaCurrentPrices[p.symbol] ?? 0;
                  const investment = p.quantity * p.buyPrice;
                  const valueNow = p.quantity * curr;
                  const pnl = valueNow - investment;
                  const pnlPercent = ((valueNow / investment - 1) * 100);
                  return (
                    <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                      <td style={{ padding: "8px", textAlign: "center" }}>{p.symbol}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{new Date(p.date).toLocaleString()}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{p.id}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>${fmt(investment)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>${fmt(p.buyPrice)}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: curr >= p.buyPrice ? "lightgreen" : "salmon" }}>${fmt(curr)}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: pnl >= 0 ? "lightgreen" : "salmon" }}>${fmt(pnl)}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: pnlPercent >= 0 ? "lightgreen" : "salmon" }}>{fmt(pnlPercent)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Historique */}
      <section style={{ marginTop: "2rem" }}>
        <h3>🕓 Historique</h3>
        {iaHistory.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "scroll" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date & Heure</th>
                  <th>Crypto</th>
                  <th>Type</th>
                  <th>Investi $</th>
                  <th>Prix achat</th>
                  <th>Prix vente</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {iaHistory.map((t, i) => (
                  <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                    <td style={{ padding: "8px", textAlign: "center" }}>{t.id}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{new Date(t.date).toLocaleString()}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{t.symbol}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{t.type}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>${fmt(t.quantity * (t.buyPrice || 0))}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>${fmt(t.buyPrice)}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>{t.type === "sell" ? `$${fmt(t.sellPrice)}` : "—"}</td>
                    <td style={{ padding: "8px", textAlign: "center", color: t.type === "sell" ? (t.profit >= 0 ? "lightgreen" : "salmon") : "#ccc" }}>
                      {t.type === "sell" ? `$${fmt(t.profit)} (${fmt((t.profit / (t.buyPrice * t.quantity)) * 100)}%)` : "—"}
                    </td>
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