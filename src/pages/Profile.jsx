// src/pages/Profile.jsx
import React, { useContext, useState, useEffect } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";
import fetchPrices from "../utils/fetchPrices";

// Formatte un nombre en $X.XX ou X.XXXX selon la taille
const formatPrice = (n) => {
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};

// Formatte un nombre en “+X.XX%” ou “-X.XX%”, couleur selon signe
const formatPercent = (v) => {
  if (v == null) return "—";
  const fixed = v.toFixed(2);
  const sign = v >= 0 ? "+" : "";
  const color = v >= 0 ? "lightgreen" : "salmon";
  return <span style={{ color }}>{sign}{fixed}%</span>;
};

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
    sellPosition,
    resetPortfolio,
  } = useContext(PortfolioContext);

  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);
  const [priceData, setPriceData] = useState({}); // { BTC: {change5min,change1d,change7d}, ... }

  // Charger les variations pour nos positions
  useEffect(() => {
    const loadVariations = async () => {
      const { top5Up, top5Down, rest } = await fetchPrices();
      const all = [...top5Up, ...top5Down, ...rest];
      const map = {};
      all.forEach((c) => {
        map[c.symbol] = c;
      });
      setPriceData(map);
    };
    loadVariations();
    const iv = setInterval(loadVariations, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Helpers pour la modale
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
  const handleChangePercent = (e) => setSellPercent(Number(e.target.value));
  const handleSetMax = () => setSellPercent(100);
  const handleCloseSell = () => setSellModal(false);

  const fmt = (n) => Number(n).toFixed(2);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#fff", fontFamily: "sans-serif", minHeight: "100vh" }}>
      <h1>👤 Mon Portefeuille</h1>
      <h2 style={{ color: "#aaa" }}>{portfolioName}</h2>

      {/* Bilan résumé */}
      <section style={{ marginTop: "1rem", backgroundColor: "#1e1e1e", padding: "1rem", borderRadius: "8px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div>💼 Solde total : ${fmt(cash + investedAmount)}</div>
          <div>💰 Cash dispo : ${fmt(cash)}</div>
          <div>📈 Investi : ${fmt(investedAmount)}</div>
          <div>📊 Positions ouvertes : {activePositionsCount}</div>
          <div>🔁 Trades : {totalTrades}</div>
          <div>✅ Positifs : {positiveTrades}/{totalTrades}</div>
          <div style={{ marginLeft: "auto", fontWeight: "bold", color: totalProfit>=0?"lightgreen":"salmon" }}>
            Rendement : ${fmt(totalProfit)} ({fmt(totalProfitPercent)}%)
          </div>
          <button
            onClick={resetPortfolio}
            style={{ marginLeft: "auto", background: "#dc3545", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            🧨 RESET PORTFOLIO
          </button>
        </div>
      </section>

      {/* Positions ouvertes avec variations */}
      <section style={{ marginTop: "2rem" }}>
        <h3>📌 Positions en cours</h3>
        {positions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ background: "#333", color: "#fff" }}>
                <th style={{ padding: "8px" }}>Symbol</th>
                <th style={{ padding: "8px" }}>Actuel</th>
                <th style={{ padding: "8px" }}>5 min</th>
                <th style={{ padding: "8px" }}>1 j</th>
                <th style={{ padding: "8px" }}>7 j</th>
                <th style={{ padding: "8px" }}>P&L</th>
                <th style={{ padding: "8px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => {
                const curr = currentPrices[p.symbol] ?? 0;
                const invested = p.quantity * p.buyPrice;
                const pnl = p.quantity * curr - invested;
                const pnlPct = pnl / invested * 100;
                const vari = priceData[p.symbol] || {};
                return (
                  <tr key={p.id} style={{ background: i%2===0?"#1e1e1e":"#252525" }}>
                    <td style={{ padding: "8px", color: "#fff" }}>{p.symbol}</td>
                    <td style={{ padding: "8px", color: curr>=p.buyPrice?"lightgreen":"salmon" }}>${formatPrice(curr)}</td>
                    <td style={{ padding: "8px" }}>{formatPercent(vari.change5min)}</td>
                    <td style={{ padding: "8px" }}>{formatPercent(vari.change1d)}</td>
                    <td style={{ padding: "8px" }}>{formatPercent(vari.change7d)}</td>
                    <td style={{ padding: "8px", color: pnl>=0?"lightgreen":"salmon" }}>
                      {fmt(pnl)}$ / {fmt(pnlPct)}%
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        onClick={() => handleSell(p.symbol, curr)}
                        style={{ background: "#dc3545", color: "#fff", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Vendre
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Historique */}
      <section style={{ marginTop: "2rem" }}>
        <h3>🕓 Historique</h3>
        {history.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((t) => (
              <li key={t.id} style={{ marginBottom: "1rem", background: "#1e1e1e", padding: "1rem", borderRadius: "6px" }}>
                <strong>{t.symbol}</strong> – {t.type.toUpperCase()} – {new Date(t.date).toLocaleString()}<br/>
                {t.type==="sell" && <>Profit: <span style={{ color: t.profit>=0?"lightgreen":"salmon" }}>${fmt(t.profit)} ({fmt((t.profit/(t.buyPrice*t.quantity))*100)}%)</span></>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modale de vente */}
      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={sellPrice}
        percent={sellPercent}
        onChangePercent={handleChangePercent}
        onSetMax={handleSetMax}
        onClose={handleCloseSell}
        onConfirm={confirmSell}
      />
    </div>
  );
};

export default Profile;