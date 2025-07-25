import React, { useContext, useEffect, useState } from "react";
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
  const [startDate, setStartDate] = useState(() => {
    const stored = localStorage.getItem("ptStartDate");
    return stored ? new Date(stored) : new Date();
  });

  useEffect(() => {
    localStorage.setItem("ptStartDate", startDate.toISOString());
  }, [startDate]);

  const handleSell = (symbol, price) => {
    setSellSymbol(symbol);
    setSellPrice(price);
    setSellPercent(100);
    setSellModal(true);
  };

  const confirmSell = () => {
    const pos = positions.find((p) => p.symbol === sellSymbol);
    if (!pos) return;
    const quantityToSell = (sellPercent / 100) * pos.quantity;
    sellPosition(pos.id, quantityToSell, sellPrice);
    setSellModal(false);
  };

  const handleChangePercent = (e) => setSellPercent(Number(e.target.value));
  const handleSetMax = () => setSellPercent(100);
  const handleCloseSell = () => setSellModal(false);

  const fmt = (n) => Number(n).toFixed(2);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>👤 Mon Portefeuille</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h2 style={{ color: "#aaa" }}>{portfolioName} | 🕒 Début du PT : {startDate.toLocaleString()}</h2>
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
          <div>💹 Bilan global</div>
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
              animation: "pulse 0.4s",
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
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr>
                  <th>Crypto</th>
                  <th>Date & Heure</th>
                  <th>ID Placement</th>
                  <th>Investi $</th>
                  <th>Prix achat</th>
                  <th>Prix actuel</th>
                  <th>Résultat $</th>
                  <th>Résultat %</th>
                  <th>Vente</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => {
                  const curr = currentPrices[p.symbol] ?? 0;
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
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          onClick={() => handleSell(p.symbol, curr)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          VENDRE
                        </button>
                      </td>
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
        {history.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "scroll" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr>
                  <th>ID Placement</th>
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
                {history.map((t, i) => (
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

      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={sellPrice}
        percent={sellPercent}
        positions={positions}
        onChangePercent={handleChangePercent}
        onSetMax={handleSetMax}
        onClose={handleCloseSell}
        onConfirm={confirmSell}
      />
    </div>
  );
};

export default Profile;