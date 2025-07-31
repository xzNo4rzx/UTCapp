import React, { useEffect, useState } from "react";
import fetchSignals from "../utils/fetchSignals";

const Signals = () => {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const loadSignals = async () => {
      const data = await fetchSignals();
      const raw = Array.isArray(data?.signals) ? data.signals : data;
      const sorted = [...raw].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSignals(sorted);
    };
    loadSignals();
  }, []);

  const getColor = (type) => {
    if (type === "BUY") return "#0f0";
    if (type === "SELL") return "#f00";
    if (type === "CONTEXT") return "#4ea8de";
    return "#aaa";
  };

  const getRiskColor = (risk = "") => {
    if (risk.includes("Faible")) return "lightgreen";
    if (risk.includes("Moyen")) return "orange";
    if (risk.includes("Élevé")) return "salmon";
    return "#ccc";
  };

  const fmt = (v) => Number(v || 0).toFixed(2);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "1rem" }}>🚨 Signaux IA</h1>

      {signals.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#888" }}>Aucun signal pour l’instant.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              {/* 🔷 En-tête signal */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{s.crypto || "—"}</div>
                <div style={{ color: "#ccc", fontSize: "1rem" }}>
                  🧠 {s.type_ia || s.type || "inconnu"}
                </div>
                <div style={{ color: getRiskColor(s.risk), fontSize: "1rem" }}>
                  Risque : {s.risk || "—"}
                </div>
              </div>

              {/* 🔍 Score et date */}
              <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "0.3rem" }}>
                📊 Score IA : {fmt(s.score)} / 5
                {s.score20 !== undefined && ` | Score global : ${fmt(s.score20)} / 20`}
                <br />
                🕒 {new Date(s.timestamp).toLocaleString()}
              </div>

              {/* 📝 Explication détaillée */}
              {Array.isArray(s.explanation) && (
                <ul style={{ marginTop: "0.5rem", color: "#ddd", fontSize: "0.95rem", lineHeight: "1.4", paddingLeft: "1.2rem" }}>
                  {s.explanation.map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              )}

              {/* 🔗 Lien TradingView */}
              <div style={{ marginTop: "0.5rem" }}>
                <a
                  href={`https://www.tradingview.com/symbols/${s.crypto?.replace("/", "")}USD`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#4ea8de", fontWeight: "bold", textDecoration: "none" }}
                >
                  → Voir sur TradingView
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Signals;