import React, { useContext, useState } from "react";
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
    currentValue,
    totalProfit,
    totalProfitPercent,
    updatePrices,
    sellPosition,
    startTime,
  } = useContext(PortfolioContext);

  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);

  const openSell = (symbol, price) => {
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

  const formattedStart = new Date(startTime).toLocaleString();

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>📊 Profil de trading</h1>
      <h2 style={{ color: "#aaa", marginTop: "-1rem" }}>{portfolioName}</h2>

      {/* Bilan global */}
      <section style={{ marginTop: "2rem", background: "#1e1e1e", padding: "1rem", borderRadius: "8px" }}>
        <h3>📋 Bilan</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
          <div>📅 Début du PT : {formattedStart}</div>
          <div>💰 Cash disponible : ${cash.toFixed(2)}</div>
          <div>📦 Valeur actuelle des positions : ${currentValue.toFixed(2)}</div>
          <div>📈 Investi : ${investedAmount.toFixed(2)}</div>
          <div>📊 Positions en cours : {positions.length}</div>
          <div>📉 Total trades : {history.filter(t => t.type === "SELL").length}</div>
          <div>✅ Victoires : {history.filter(t => t.type === "SELL" && t.profit >= 0).length}</div>
          <div style={{ marginLeft: "auto", backgroundColor: "#222", padding: "1rem", borderRadius: "8px", textAlign: "right" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>📊 Rendement total :</div>
            <div style={{ color: totalProfit >= 0 ? "lightgreen" : "salmon", fontSize: "1.1rem" }}>
              ${totalProfit.toFixed(2)} ({totalProfitPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </section>

      {/* Boutons */}
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => {
            updatePrices();
            const btn = document.getElementById("updateBtn");
            if (btn) {
              btn.style.transform = "rotate(360deg)";
              setTimeout(() => (btn.style.transform = "rotate(0deg)"), 500);
            }
          }}
          id="updateBtn"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "transform 0.5s",
          }}
        >
          🔄 UPDATE PRICES NOW
        </button>

        <button
          onClick={() => {
            const ok = confirm("Réinitialiser le portefeuille à 10 000 $ ? Cette action est irréversible.");
            if (ok) window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔁 RESET PT TO 10000$
        </button>
      </div>

      {/* Positions en cours */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📍 Positions en cours</h3>
        {positions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Crypto", "Date d'achat", "Qté", "Investi ($)", "Prix d'achat", "Prix actuel", "P&L", "Action"].map((h) => (
                    <th key={h} style={{ border: "1px solid #444", padding: "8px", textAlign: "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => {
                  const curr = currentPrices[p.symbol] ?? 0;
                  const invested = p.quantity * p.buyPrice;
                  const pnl = (curr - p.buyPrice) * p.quantity;
                  return (
                    <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                      <td style={{ padding: "8px", textAlign: "center" }}>{p.symbol}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{new Date(p.date).toLocaleString()}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{p.quantity.toFixed(6)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>${invested.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>${p.buyPrice.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>${curr.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: pnl >= 0 ? "lightgreen" : "salmon" }}>
                        ${pnl.toFixed(2)}
                      </td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          onClick={() => openSell(p.symbol, curr)}
                          style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
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

      {/* Historique des transactions */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📜 Historique</h3>
        {history.length === 0 ? (
          <p>Aucune transaction enregistrée.</p>
        ) : (
          history.map((t, i) => (
            <div key={t.id} style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#1e1e1e", borderRadius: "6px" }}>
              <div>🕒 {new Date(t.date).toLocaleString()}</div>
              <div>🔖 Transaction ID : {t.id}</div>
              <div>🔹 Crypto : {t.symbol}</div>
              {t.type === "BUY" ? (
                <>
                  <div>💸 Investissement : ${t.value.toFixed(2)}</div>
                  <div>📥 Prix d’achat : ${t.buyPrice.toFixed(2)}</div>
                  <div>📦 Quantité : {t.quantity.toFixed(6)}</div>
                </>
              ) : (
                <>
                  <div>📤 Prix de vente : ${t.sellPrice.toFixed(2)}</div>
                  <div>💰 Profit : <span style={{ color: t.profit >= 0 ? "lightgreen" : "salmon" }}>${t.profit.toFixed(2)}</span></div>
                </>
              )}
            </div>
          ))
        )}
      </section>

      {/* Sell Modal */}
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