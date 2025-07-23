// src/pages/Home.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PortfolioContext } from "../context/PortfolioContext";

const Home = () => {
  const { portfolio } = useContext(PortfolioContext);

  if (!portfolio) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", color: "#ccc" }}>
        Chargement…
      </div>
    );
  }

  // Extraction des champs, avec fallback si null/undefined
  const {
    id = "—",
    startDate = new Date().toISOString(),
    cumulativeUsd = 0,
    cumulativePercent = 0,
    history = [],
  } = portfolio;

  const safeUsd = cumulativeUsd ?? 0;
  const safePct = cumulativePercent ?? 0;

  // Calcul du ratio de trades gagnants
  const sells = history.filter((t) => t.type === "sell");
  const wins = sells.filter((t) => (t.amountUsd ?? 0) > ((t.entryPrice ?? 0) * ((t.amountUsd ?? 0) / (t.price ?? 1)))).length;

  // Helper de format
  const fmt2 = (v) => Number(v).toFixed(2);

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#121212",
        color: "#eee",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <h1>🏆 Ultimate Trading Champions (UTC)</h1>

      {/* Portefeuille virtuel */}
      <section
        style={{
          margin: "2rem 0",
          padding: "1rem",
          backgroundColor: "#1e1e1e",
          borderRadius: "6px",
        }}
      >
        <h2>💼 Portefeuille virtuel</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            backgroundColor: "#222",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #333",
            color: "#ddd",
          }}
        >
ID du PT         : {id}  
Ouverture        : {new Date(startDate).toLocaleString()}  
Gain / Perte     : ${fmt2(safeUsd)} ({fmt2(safePct)}%)  
Trades gagnants  : {wins} / {sells.length}
        </pre>
        <Link
          to="/trading"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            color: "#4ea8de",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          → Aller au Trading
        </Link>
      </section>

      {/* IA Trader */}
      <section
        style={{
          margin: "2rem 0",
          padding: "1rem",
          backgroundColor: "#1e1e1e",
          borderRadius: "6px",
        }}
      >
        <Link to="/ia-trader" style={{ textDecoration: "none", color: "inherit" }}>
          <h2>🤖 IA Trader</h2>
          <p>
            Recevez des signaux d’achat/vente basés sur l’analyse des 6 derniers
            mois et en temps réel.
          </p>
          <small style={{ color: "#aaa" }}>Cliquez pour découvrir</small>
        </Link>
      </section>

      {/* Navigation vers Analyse, Signaux, Profil */}
      <section
        style={{
          margin: "2rem 0",
          display: "flex",
          gap: "1rem",
        }}
      >
        <Link
          to="/analysis"
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "#1e1e1e",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#eee",
            border: "1px solid #333",
          }}
        >
          <h3>📈 Analyse</h3>
          <p>Graphiques et indicateurs pour comprendre les tendances.</p>
        </Link>
        <Link
          to="/signals"
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "#1e1e1e",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#eee",
            border: "1px solid #333",
          }}
        >
          <h3>🚨 Signaux</h3>
          <p>Liste des signaux générés par l’IA.</p>
        </Link>
        <Link
          to="/profile"
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "#1e1e1e",
            borderRadius: "6px",
            textDecoration: "none",
            color: "#eee",
            border: "1px solid #333",
          }}
        >
          <h3>👤 Profil</h3>
          <p>Gérez votre compte, historique et paramètres.</p>
        </Link>
      </section>
    </div>
  );
};

export default Home;