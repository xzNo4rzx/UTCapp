import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PortfolioContext } from "../context/PortfolioContext";
import { IATraderContext } from "../context/IATraderContext";

const Home = () => {
  const {
    portfolioName,
    startDate,
    cash,
    positions,
    history,
    currentPrices,
    totalProfit,
    totalProfitPercent,
  } = useContext(PortfolioContext);

  const {
    iaName,
    iaStart,
    iaCash,
    iaPositions,
    iaHistory,
    iaCurrentPrices,
    iaTotalProfit,
    iaTotalProfitPercent,
  } = useContext(IATraderContext);

  const fmt = (v, d = 2) => (v ? Number(v).toFixed(d) : "0.00");

  const formatDate = (str) =>
    new Date(str || new Date()).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const countWins = (arr = []) => arr.filter((t) => t.profit > 0).length;

  const renderBox = ({
    title,
    name,
    start,
    cash,
    positions = [],
    history = [],
    totalProfit,
    totalProfitPercent,
    to,
  }) => {
    const winCount = countWins(history);
    const totalTrades = history.length;
    const openPositions = positions.length;
    const invested = positions.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
    const valueNow = positions.reduce((s, p) => {
      const curr = (p?.symbol && (currentPrices?.[p.symbol] || iaCurrentPrices?.[p.symbol])) ?? p.buyPrice;
      return s + p.quantity * curr;
    }, 0);
    const rendement = cash + valueNow - 10000;
    const rendementPercent = ((cash + valueNow - 10000) / 10000) * 100;

    return (
      <section
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#1e1e1e",
          borderRadius: "8px",
          fontFamily: "sans-serif",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <h2>{title}</h2>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Nom : <strong>{name}</strong><br />
              Démarré le : {formatDate(start)}<br />
              Cash disponible : ${fmt(cash)}<br />
              Positions en cours : {openPositions}<br />
              Valeur actuelle des positions : ${fmt(valueNow)}<br />
              Total investi : ${fmt(invested)}<br />
              Trades gagnants : {winCount} / {totalTrades}
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: rendement >= 0 ? "#153d27" : "#3d1d1d",
              color: rendement >= 0 ? "lightgreen" : "salmon",
              borderRadius: "8px",
              minWidth: "180px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Rendement total<br />
            ${fmt(rendement)} ({fmt(rendementPercent)}%)
          </div>
        </div>
        <Link
          to={to}
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "6px 12px",
            backgroundColor: "#4ea8de",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            fontWeight: "bold",
          }}
        >
          → Accéder
        </Link>
      </section>
    );
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", minHeight: "100vh", color: "#eee" }}>
      <h1 style={{ marginBottom: "2rem" }}>🏆 Ultimate Trading Champions (UTC)</h1>

      {/* Bloc Portefeuille virtuel */}
      {renderBox({
        title: "💼 Portefeuille virtuel",
        name: portfolioName,
        start: startDate,
        cash,
        positions,
        history,
        currentPrices,
        totalProfit,
        totalProfitPercent,
        to: "/trading",
      })}

      {/* Bloc IA Trader */}
      {renderBox({
        title: "🤖 IA Trader",
        name: iaName,
        start: iaStart,
        cash: iaCash,
        positions: iaPositions,
        history: iaHistory,
        currentPrices: iaCurrentPrices,
        totalProfit: iaTotalProfit,
        totalProfitPercent: iaTotalProfitPercent,
        to: "/ia-trader",
      })}

      {/* Navigation vers les autres pages */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/analysis" style={boxLinkStyle}>
          <h3>📊 Analyse</h3>
          <p>Voir les tendances et graphiques sur 6 mois.</p>
        </Link>
        <Link to="/signals" style={boxLinkStyle}>
          <h3>📡 Signaux</h3>
          <p>Liste des opportunités détectées par l’IA.</p>
        </Link>
        <Link to="/profile" style={boxLinkStyle}>
          <h3>👤 Profil</h3>
          <p>Voir votre historique et vos performances.</p>
        </Link>
      </div>
    </div>
  );
};

const boxLinkStyle = {
  flex: "1",
  minWidth: "250px",
  backgroundColor: "#1e1e1e",
  color: "#eee",
  textDecoration: "none",
  borderRadius: "6px",
  padding: "1rem",
  border: "1px solid #333",
};

export default Home;