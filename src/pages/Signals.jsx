// src/pages/Signals.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PortfolioContext } from "../context/PortfolioContext";

const Signals = () => {
  // TODO : remplacer cette liste statique par vos signaux réels (depuis un contexte ou un appel API)
  const placeholderSignals = [
    { symbol: "BTC", type: "buy", reliability: "high", price: 30500, timestamp: "2025-07-23 15:30" },
    { symbol: "ETH", type: "sell", reliability: "medium", price: 1890, timestamp: "2025-07-23 14:50" },
    { symbol: "SOL", type: "buy", reliability: "low", price: 78.5, timestamp: "2025-07-23 14:20" },
    // …
  ];

  // Si vous stockez vos signaux dans le PortfolioContext, décommentez :
  // const { signals } = useContext(PortfolioContext);
  // const displayedSignals = signals || placeholderSignals;
  const displayedSignals = placeholderSignals;

  // Couleurs par fiabilité
  const badgeColors = {
    high:   { bg: "#10b981", text: "#fff" }, // vert vif
    medium: { bg: "#f59e0b", text: "#fff" }, // orange
    low:    { bg: "#6b7280", text: "#fff" }, // gris
  };

  // Mise en avant des lignes haute fiabilité
  const rowHighlight = (reliability) =>
    reliability === "high"
      ? { boxShadow: "0 0 8px rgba(16,185,129,0.7)" }
      : {};

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "sans-serif",
      background: "#000",
      minHeight: "100vh",
      color: "#e5e7eb"
    }}>
      <h1 style={{ marginBottom: "1.5rem", color: "#f3f4f6" }}>🚨 Signaux de trading</h1>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
      }}>
        <thead>
          <tr>
            <th style={{
              padding: "12px",
              textAlign: "left",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>Pair</th>
            <th style={{
              padding: "12px",
              textAlign: "right",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>Prix (USD)</th>
            <th style={{
              padding: "12px",
              textAlign: "center",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>Type</th>
            <th style={{
              padding: "12px",
              textAlign: "center",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>Fiabilité</th>
            <th style={{
              padding: "12px",
              textAlign: "center",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>Heure</th>
            <th style={{
              padding: "12px",
              textAlign: "center",
              borderBottom: "2px solid #374151",
              color: "#d1d5db"
            }}>TradingView</th>
          </tr>
        </thead>
        <tbody>
          {displayedSignals.map((s, i) => (
            <tr key={i} style={{
              background: i % 2 === 0 ? "#111827" : "#1f2937",
              ...rowHighlight(s.reliability)
            }}>
              <td style={{ padding: "12px", color: "#e5e7eb" }}>{s.symbol}/USD</td>
              <td style={{ padding: "12px", textAlign: "right", color: "#e5e7eb" }}>
                ${s.price.toFixed(2)}
              </td>
              <td style={{
                padding: "12px",
                textAlign: "center",
                color: s.type === "buy" ? "#10b981" : "#ef4444",
                fontWeight: "bold"
              }}>
                {s.type === "buy" ? "Achat" : "Vente"}
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: badgeColors[s.reliability].bg,
                  color: badgeColors[s.reliability].text,
                  fontSize: "0.9rem",
                  textTransform: "uppercase"
                }}>
                  {s.reliability}
                </span>
              </td>
              <td style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "0.9rem",
                color: "#9ca3af"
              }}>
                {s.timestamp}
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                <a
                  href={`https://www.tradingview.com/symbols/${s.symbol}USD`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#3b82f6",
                    fontSize: "1.2rem",
                    fontWeight: "bold"
                  }}
                >
                  →
                </a>
              </td>
            </tr>
          ))}
          {displayedSignals.length === 0 && (
            <tr>
              <td colSpan="6" style={{
                padding: "12px",
                textAlign: "center",
                color: "#9ca3af"
              }}>
                Aucun signal disponible pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Signals;