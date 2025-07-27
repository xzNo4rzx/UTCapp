import React, { useContext, useState, useEffect } from "react";
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
    resetIATrader,
  } = useContext(IATraderContext);

  const [startDate] = useState(() => new Date(iaStart));
  const [ptHistory, setPtHistory] = useState([]);
  const fmt = (n) => Number(n).toFixed(2);

  const investedAmount = iaPositions.reduce((sum, p) => sum + p.quantity * p.buyPrice, 0);
  const activePositionsCount = iaPositions.length;
  const totalTrades = iaHistory.filter((t) => t.type === "buy").length;
  const positiveTrades = iaHistory.filter((t) => t.type === "sell" && t.profit > 0).length;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ia-pt-history") || "[]");
    setPtHistory(stored);
  }, []);

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
            animation: "shake 0.4s",
          }}
        >
          🔄 UPDATE PRICES NOW
        </button>
        <button
          onClick={() => {
            if (window.confirm("Confirmer la réinitialisation de l'IA Trader à 10 000 $ ?")) {
              resetIATrader();
            }
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🧨 RESET IA TRADER TO 10000$
        </button>
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            50% { transform: translateX(2px); }
            75% { transform: translateX(-2px); }
            100% { transform: translateX(0); }
          }
        `}</style>
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

      {/* Positions */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📌 Positions en cours</h3>
        {iaPositions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {iaPositions.map((p) => {
              const curr = iaCurrentPrices[p.symbol] ?? 0;
              const investment = p.quantity * p.buyPrice;
              const valueNow = p.quantity * curr;
              const pnl = valueNow - investment;
              const pnlPercent = ((valueNow / investment - 1) * 100);
              return (
                <div key={p.id} style={{
                  borderLeft: `6px solid ${pnl >= 0 ? "#0f0" : "#f00"}`,
                  backgroundColor: "#1e1e1e",
                  borderRadius: "8px",
                  padding: "1rem",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{p.symbol}</div>
                    <div style={{ color: curr >= p.buyPrice ? "lightgreen" : "salmon" }}>${fmt(curr)}</div>
                    <div style={{ color: pnl >= 0 ? "lightgreen" : "salmon" }}>{fmt(pnl)}$ / {fmt(pnlPercent)}%</div>
                  </div>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                    🕒 {new Date(p.date).toLocaleString()} | ID : {p.id} | Investi : ${fmt(investment)} | Achat : ${fmt(p.buyPrice)} | Actuel : ${fmt(curr)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Historique */}
      <section style={{ marginTop: "2rem" }}>
        <h3>🕓 Historique</h3>
        {iaHistory.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "500px", overflowY: "auto" }}>
            {iaHistory.map((t) => (
              <div key={t.id} style={{
                borderLeft: `6px solid ${t.type === "sell" ? (t.profit >= 0 ? "#0f0" : "#f00") : "#888"}`,
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "1rem",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: "bold" }}>{t.symbol}</div>
                  <div style={{ color: "#ccc" }}>{t.type.toUpperCase()}</div>
                  <div style={{ color: t.type === "sell" ? (t.profit >= 0 ? "lightgreen" : "salmon") : "#ccc" }}>
                    {t.type === "sell" ? `$${fmt(t.profit)} (${fmt((t.profit / (t.buyPrice * t.quantity)) * 100)}%)` : "—"}
                  </div>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                  🕒 {new Date(t.date).toLocaleString()} | ID : {t.id} | Investi : ${fmt(t.quantity * t.buyPrice)} | Achat : ${fmt(t.buyPrice)} | Vente : {t.type === "sell" ? `$${fmt(t.sellPrice)}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historique des anciens IA Trader */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📚 Historique des anciens IA Trader</h3>
        {ptHistory.length === 0 ? (
          <p>Aucun PT précédent.</p>
        ) : (
          <>
            <p style={{ color: "#aaa" }}>
              Moyenne des rendements :{" "}
              <strong style={{ color: "lightgreen" }}>
                {
                  (
                    ptHistory.reduce((sum, h) => sum + parseFloat(h.percent), 0) /
                    ptHistory.length
                  ).toFixed(2)
                }
                %
              </strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {ptHistory.map((pt, i) => (
                <div key={i} style={{
                  borderLeft: `6px solid ${pt.percent >= 0 ? "#0f0" : "#f00"}`,
                  backgroundColor: "#1e1e1e",
                  borderRadius: "8px",
                  padding: "1rem"
                }}>
                  <div style={{ fontWeight: "bold" }}>{pt.name}</div>
                  <div>Début : {new Date(pt.start).toLocaleString()}</div>
                  <div>Fin : {new Date(pt.end).toLocaleString()}</div>
                  <div>Résultat : ${pt.result}</div>
                  <div style={{ color: pt.percent >= 0 ? "lightgreen" : "salmon" }}>
                    Rendement : {pt.percent}%
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default IATrader;