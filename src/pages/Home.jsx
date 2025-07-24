import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PortfolioContext } from "../context/PortfolioContext";

const Home = () => {
  const {
    portfolioName,
    startDate,
    totalProfit,
    totalProfitPercent,
    history,
    positions,
    cash,
    investedAmount
  } = useContext(PortfolioContext);

  const fmt2 = (v) => Number(v ?? 0).toFixed(2);
  const startStr = new Date(startDate).toLocaleString();

  const closedTrades = history.length;
  const openTrades = positions.length;
  const totalTrades = closedTrades + openTrades;

  const wins = history.filter((t) => t.profit > 0).length;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", color: "#eee", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>🏆 Ultimate Trading Champions (UTC)</h1>

      {/* Bilan du portefeuille virtuel */}
      <section style={{ margin: "2rem 0", padding: "1rem", backgroundColor: "#1e1e1e", borderRadius: "6px" }}>
        <h2>💼 Portefeuille virtuel</h2>
        <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#222", padding: "1rem", borderRadius: "4px", border: "1px solid #333", color: "#ddd" }}>
Nom du PT        : {portfolioName}
Démarrage        : {startStr}
Cash disponible  : ${fmt2(cash)}  
Investi          : ${fmt2(investedAmount)} sur {openTrades} position{openTrades > 1 ? "s" : ""}
Rendement total  : ${fmt2(totalProfit)} ({fmt2(totalProfitPercent)}%)
Trades gagnants  : {wins} / {totalTrades}
        </pre>
        <Link to="/trading" style={{ display: "inline-block", marginTop: "1rem", color: "#4ea8de", textDecoration: "none", fontWeight: "bold" }}>
          → Aller au Trading
        </Link>
      </section>

      {/* IA Trader */}
      <section style={{ margin: "2rem 0", padding: "1rem", backgroundColor: "#1e1e1e", borderRadius: "6px" }}>
        <Link to="/ia-trader" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>🤖 IA Trader</h2>
          <p>Recevez des signaux d’achat/vente basés sur l’analyse des 6 derniers mois et en temps réel.</p>
          <p style={{ color: "#aaa" }}>
            <em>Statut : </em><strong style={{ color: "gold" }}>Démarrage en cours</strong>
          </p>
          <small style={{ color: "#aaa" }}>Cliquez pour découvrir</small>
        </Link>
      </section>

      {/* Navigation */}
      <section style={{ margin: "2rem 0", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/analysis" style={cardStyle}>
          <h3>📈 Analyse</h3>
          <p>Graphiques et indicateurs pour comprendre les tendances.</p>
        </Link>
        <Link to="/signals" style={cardStyle}>
          <h3>🚨 Signaux</h3>
          <p>Liste des signaux générés par l’IA.</p>
        </Link>
        <Link to="/profile" style={cardStyle}>
          <h3>👤 Profil</h3>
          <p>Gérez votre compte, historique et paramètres.</p>
        </Link>
      </section>
    </div>
  );
};

const cardStyle = {
  flex: "1 1 250px",
  padding: "1rem",
  backgroundColor: "#1e1e1e",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#eee",
  border: "1px solid #333",
  transition: "background-color 0.3s",
};

export default Home;