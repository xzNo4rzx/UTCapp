// src/pages/Signals.jsx
import React, { useEffect, useState } from "react";
import fetchSignals from "../utils/fetchSignals";

const Signals = () => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const loadSignals = async () => {
      const data = await fetchSignals();
      if (Array.isArray(data?.signals)) {
        const sorted = [...data.signals].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setSignals(sorted);
      }
    };
    loadSignals();
  }, []);

  const getColor = (type) => {
    if (type === "BUY") return "#0f0";
    if (type === "SELL") return "#f00";
    if (type === "CONTEXT") return "#4ea8de";
    return "#aaa";
  };

  const getRiskColor = (risk) => {
    if (risk.includes("Faible")) return "lightgreen";
    if (risk.includes("Moyen")) return "orange";
    if (risk.includes("Élevé")) return "salmon";
    return "#ccc";
  };

  const fmt = (v) => Number(v).toFixed(2);

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h1>🚨 Signaux IA</h1>
      {signals.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#888" }}>
          Aucun signal pour l’instant.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          {signals.map((s, i) => (
            <div
              key={i}
              style={{
                borderLeft: `6px solid ${getColor(s.type)}`,
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  {s.crypto}
                </div>
                <div style={{ color: "#ccc", fontSize: "1rem" }}>
                  {s.type_ia || s.type}
                </div>
                <div
                  style={{
                    color: getRiskColor(s.risk),
                    fontSize: "1rem",
                  }}
                >
                  Risque : {s.risk}
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#aaa",
                  marginTop: "0.25rem",
                }}
              >
                🧠 Score IA : {fmt(s.score)} —{" "}
                {new Date(s.timestamp).toLocaleString()}
              </div>
              {Array.isArray(s.explanation) && (
                <ul
                  style={{
                    marginTop: "0.5rem",
                    color: "#ddd",
                    fontSize: "0.95rem",
                    lineHeight: "1.4",
                    paddingLeft: "1.2rem",
                  }}
                >
                  {s.explanation.map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Signals;