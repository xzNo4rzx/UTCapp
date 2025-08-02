import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PortfolioContext } from "../context/PortfolioContext";
import { IATraderContext } from "../context/IATraderContext";
import { useUserStorage } from "../hooks/useUserStorage";

const Home = () => {
  const {
    portfolioName, cash, positions, history, currentPrices,
  } = useContext(PortfolioContext);

  const {
    iaName, iaStart, iaCash, iaPositions, iaHistory, iaCurrentPrices,
  } = useContext(IATraderContext);

  const [ptStartDate] = useUserStorage("ptStartDate", null); // ✅ déplacé ici (dans le corps du composant)

  const fmt = (v, d = 2) => (v ? Number(v).toFixed(d) : "0.00");

  const formatDate = (str) =>
    new Date(str || new Date()).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const countWins = (arr = []) => arr.filter((t) => t.profit > 0).length;

  const renderBox = ({
    title, name, start, cash,
    positions = [], history = [],
    currentPrices, to
  }) => {
    const winCount = countWins(history);
    const totalTrades = history.length;
    const invested = positions.reduce((s, p) => s + p.quantity * p.buyPrice, 0);
    const valueNow = positions.reduce((s, p) => {
      const curr = (p?.symbol && currentPrices?.[p.symbol]) ?? p.buyPrice;
      return s + p.quantity * curr;
    }, 0);
    const rendement = cash + valueNow - 10000;
    const rendementPercent = ((cash + valueNow - 10000) / 10000) * 100;

    return (
      <section className="slide-up-box" style={boxStyle}>
        <h2>{title}</h2>
        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
          Nom : <strong>{name}</strong><br />
          Démarré le : {start ? formatDate(start) : "—"}<br />
          Cash disponible : ${fmt(cash)}<br />
          Positions en cours : {positions.length}<br />
          Valeur actuelle : ${fmt(valueNow)}<br />
          Total investi : ${fmt(invested)}<br />
          Trades gagnants : {winCount} / {totalTrades}
        </p>

        {/* ✅ RENDU PLUS PETIT ICI */}
        <div style={{
          marginTop: "1rem",
          padding: "0.5rem",
          backgroundColor: rendement >= 0 ? "#153d27" : "#3d1d1d",
          color: rendement >= 0 ? "lightgreen" : "salmon",
          borderRadius: "6px",
          textAlign: "center",
          fontSize: "0.9rem",
          maxWidth: "90px", // ← ici la largeur réduite
        }}>
          <div style={{ fontWeight: "bold" }}>Rendement total</div>
          <div>${fmt(rendement)}<br />({fmt(rendementPercent)}%)</div>
        </div>

        <Link to={to} style={btnStyle}>→ Accéder</Link>
      </section>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={rowStyle}>
        {renderBox({
          title: "💼 Portefeuille virtuel",
          name: portfolioName,
          start: ptStartDate,
          cash,
          positions,
          history,
          currentPrices,
          to: "/trading",
        })}
        {renderBox({
          title: "🤖 IA Trader",
          name: iaName,
          start: iaStart,
          cash: iaCash,
          positions: iaPositions,
          history: iaHistory,
          currentPrices: iaCurrentPrices,
          to: "/ia-trader",
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "3rem" }}>
        <Link to="/analysis" style={linkBox}>📊 Analyse<br />Voir les tendances</Link>
        <Link to="/signals" style={linkBox}>📡 Signaux<br />Opportunités IA</Link>
        <Link to="/profile" style={linkBox}>👤 Profil<br />Historique & stats</Link>
      </div>

      <style>{`
        .slide-up-box {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// 🎨 STYLES
const pageStyle = {
  padding: "6rem 2rem 2rem",
  backgroundImage: 'url("/backgrounds/homebackground.png")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  minHeight: "100vh",
  color: "#eee"
};

const rowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "2rem",
  flexWrap: "wrap"
};

const boxStyle = {
  width: "250px", // ← taille fixe des 2 encarts principaux (réduit)
  padding: "1.5rem",
  backgroundColor: "rgba(30,30,30,0.6)",
  borderRadius: "8px",
  fontFamily: "sans-serif",
  backdropFilter: "blur(10px)",
  flexShrink: 0
};

const linkBox = {
  flex: "1",
  minWidth: "250px",
  backgroundColor: "rgba(30,30,30,0.6)",
  color: "#eee",
  textDecoration: "none",
  borderRadius: "6px",
  padding: "1rem",
  border: "1px solid #333",
  backdropFilter: "blur(6px)",
  fontWeight: "bold"
};

const btnStyle = {
  display: "inline-block",
  marginTop: "1rem",
  padding: "4px 8px",
  backgroundColor: "#4ea8de",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "4px",
  fontWeight: "bold",
  fontSize: "0.85rem"
};

export default Home;