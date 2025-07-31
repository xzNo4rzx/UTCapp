import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";

const Profile = () => {
  const {
    portfolioName,
    cash,
    positions,
    history,
    currentPrices,
    investedAmount,
    activePositionsCount,
    totalTrades,
    positiveTrades,
    totalProfit,
    totalProfitPercent,
    updatePrices,
    resetPortfolio,
    sellPosition,
  } = useContext(PortfolioContext);

  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);
  const [startDate] = useState(() => {
    const stored = localStorage.getItem("ptStartDate");
    return stored ? new Date(stored) : new Date();
  });

  // État pour stocker les variations 5m, 1j et 7j
  const [variations, setVariations] = useState({});

  useEffect(() => {
    // On garde la date de début en localStorage
    localStorage.setItem("ptStartDate", startDate.toISOString());
  }, [startDate]);

  useEffect(() => {
    // On va chercher les variations via l'endpoint UTCapp
    const fetchVariations = async () => {
      try {
        const resp = await axios.get("/utcapp/variations");
        setVariations(resp.data);
      } catch (err) {
        console.error("Erreur fetch variations :", err);
      }
    };
    fetchVariations();
  }, [positions]);

  const handleSell = (symbol, price) => {
    setSellSymbol(symbol);
    setSellPrice(price);
    setSellPercent(100);
    setSellModal(true);
  };

  const confirmSell = () => {
    const pos = positions.find((p) => p.symbol === sellSymbol);
    if (!pos) return;
    const qty = (sellPercent / 100) * pos.quantity;
    sellPosition(pos.id, qty, sellPrice);
    setSellModal(false);
  };

  const fmt = (n) => Number(n).toFixed(2);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>👤 Mon Portefeuille</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h2 style={{ color: "#aaa" }}>
          {portfolioName} | 🕒 Début du PT : {startDate.toLocaleString()}
        </h2>
        <button
          onClick={() => {
            if (window.confirm("Confirmer la remise à zéro ? Cela clôturera le portefeuille actuel.")) {
              localStorage.removeItem("ptStartDate");
              resetPortfolio();
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
          🧨 RESET PT TO 10000$
        </button>
      </div>

      {/* Bilan */}
      <section style={{ backgroundColor: "#1e1e1e", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>📊 Bilan</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div>💼 Solde total : ${fmt(cash + investedAmount)}</div>
          <div>💰 Cash disponible : ${fmt(cash)}</div>
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
            color: totalProfit >= 0 ? "lightgreen" : "salmon",
          }}>
            📈 Rendement total : ${fmt(totalProfit)} ({fmt(totalProfitPercent)}%)
          </div>
          <button
            onClick={updatePrices}
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
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
        </div>
      </section>

      {/* Positions en cours */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📌 Positions en cours</h3>
        {positions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {positions.map((p) => {
              const curr = currentPrices[p.symbol] ?? 0;
              const inv = p.quantity * p.buyPrice;
              const valueNow = p.quantity * curr;
              const pnl = valueNow - inv;
              const pnlPct = (valueNow / inv - 1) * 100;

              const v = variations[p.symbol] || {};
              const changeLine = `${(v["5m"] ?? 0).toFixed(2)}% (5m) | ${(v["1d"] ?? 0).toFixed(2)}% (1j) | ${(v["7d"] ?? 0).toFixed(2)}% (7j)`;

              return (
                <div key={p.id} style={{
                  borderLeft: `6px solid ${pnl >= 0 ? "#0f0" : "#f00"}`,
                  backgroundColor: "#1e1e1e",
                  borderRadius: "8px",
                  padding: "1rem",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{p.symbol}</div>
                    <div style={{ color: curr >= p.buyPrice ? "lightgreen" : "salmon" }}>${fmt(curr)}</div>
                    <div style={{ color: pnl >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt(pnl)}$ / {fmt(pnlPct)}%
                    </div>
                  </div>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                    🕒 {new Date(p.date).toLocaleString()} | ID : {p.id} | Investi : ${fmt(inv)} | Achat : ${fmt(p.buyPrice)}
                  </div>
                  <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#aaa" }}>
                    📊 Variation : {changeLine}
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      onClick={() => handleSell(p.symbol, curr)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      VENDRE
                    </button>
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
        {history.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "500px", overflowY: "auto" }}>
            {history.map((t) => (
              <div key={t.id} style={{
                borderLeft: `6px solid ${t.type === "sell" ? (t.profit >= 0 ? "#0f0" : "#f00") : "#888"}`,
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "1rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: "bold" }}>{t.symbol}</div>
                  <div style={{ color: "#ccc" }}>{t.type.toUpperCase()}</div>
                  <div style={{ color: t.type === "sell" ? (t.profit >= 0 ? "lightgreen" : "salmon") : "#ccc" }}>
                    {t.type === "sell" ? `$${fmt(t.profit)} (${fmt((t.profit/(t.buyPrice*t.quantity))*100)}%)` : "—"}
                  </div>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                  🕒 {new Date(t.date).toLocaleString()} | ID : {t.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={sellPrice}
        percent={sellPercent}
        positions={positions}
        onChangePercent={(e) => setSellPercent(Number(e.target.value))}
        onSetMax={() => setSellPercent(100)}
        onClose={() => setSellModal(false)}
        onConfirm={confirmSell}
      />
    </div>
  );
};

export default Profile;