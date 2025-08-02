import React, { useEffect, useState } from "react";
import fetchSignals from "../utils/fetchSignals";

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [logs, setLogs] = useState([]);

  const fmt = (v) => Number(v || 0).toFixed(2);

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

  const fetchLogLines = async () => {
    try {
      const res = await fetch("https://utc-api.onrender.com/signals-log");
      const text = await res.text();
      const lines = text.split("\n").filter(Boolean).slice(-25);
      setLogs(lines.reverse());
    } catch (err) {
      console.error("Erreur chargement log :", err);
      setLogs(prev => [...prev, "❌ Erreur lecture logs."]);
    }
  };

  const loadSignals = async () => {
    try {
      const data = await fetchSignals();
      const raw = Array.isArray(data?.signals) ? data.signals : data;
      const sorted = [...raw].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSignals(sorted);
    } catch (err) {
      console.error("Erreur chargement signaux :", err);
    }
  };

  useEffect(() => {
    loadSignals();
    fetchLogLines();
    const timer = setInterval(() => {
      fetchLogLines();
      loadSignals();
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      backgroundImage: 'url("/backgrounds/homebackground.png")',
      backgroundSize: '100% auto',
      backgroundPosition: "center",
      backgroundAttachment: 'fixed',
      padding: "6rem 2rem 2rem",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>
      {/* 🔒 BARRE FIXE TITRE */}
      <div style={{
        position: "sticky",
        top: "0",
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
        borderRadius: "6px",
        marginBottom: "1.5rem"
      }}>
        <h1>🚨 Signaux IA</h1>
      </div>

      {/* 🧾 CONSOLE DE LOGS */}
      <div style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: "6px",
        padding: "1rem",
        marginBottom: "2rem",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        maxHeight: "180px",
        overflowY: "auto",
        boxShadow: "inset 0 0 4px #000"
      }}>
        {logs.length === 0 ? (
          <div style={{ color: "#888" }}>Aucun log pour le moment…</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ color: "#4ea8de" }}>{log}</div>
          ))
        )}
      </div>

      {/* 🔍 SIGNALS ENCADRÉS */}
      <div style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "1rem",
        borderRadius: "8px",
        maxHeight: "65vh",
        overflowY: "auto"
      }}>
        {signals.length === 0 ? (
          <p style={{ color: "#888" }}>Aucun signal pour l’instant.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {signals.map((s, i) => (
              <div
                key={i}
                style={{
                  borderLeft: `6px solid ${getColor(s.type)}`,
                  backgroundColor: "rgba(30, 30, 30, 0.6)",
                  backdropFilter: "blur(8px)",
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
    </div>
  );
};

export default Signals;