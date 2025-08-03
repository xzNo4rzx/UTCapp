import React, { useEffect, useState } from "react";
import { fetchLatestSignals } from "../utils/firestoreSignals"; // 🔁 Firestore
const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

// ████████ 🧠 COMPOSANT PRINCIPAL ████████
const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [logs, setLogs] = useState([]);

  // 🎯 Formateur de nombre
  const fmt = (v) => Number(v || 0).toFixed(2);

  // 🎨 Couleur par type de signal
  const getColor = (type) => {
    if (type === "BUY") return "#0f0";
    if (type === "SELL") return "#f00";
    if (type === "CONTEXT") return "#4ea8de";
    return "#aaa";
  };

  // 🎨 Couleur par niveau de risque
  const getRiskColor = (risk = "") => {
    if (risk.includes("Faible")) return "lightgreen";
    if (risk.includes("Moyen")) return "orange";
    if (risk.includes("Élevé")) return "salmon";
    return "#ccc";
  };

  // 🔁 Lecture logs serveur API
  const fetchLogLines = async () => {
    try {
      const res = await fetch("https://ai-signal-api.onrender.com/signals-log");
      const text = await res.text();
      const lines = text.split("\n").filter(Boolean).slice(-25).reverse();
      setLogs(lines);
    } catch (err) {
      console.error("❌ Erreur chargement logs:", err);
      setLogs((prev) => [...prev, "❌ Erreur lecture logs serveur."]);
    }
  };

  // 🔁 Lecture signaux Firestore
  const loadSignals = async () => {
    try {
      const data = await fetchLatestSignals(); // 🔥 Firebase Firestore
      if (!Array.isArray(data)) throw new Error("Données invalides");
      const sorted = [...data].sort((a, b) => {
        const ta = new Date(a.timestamp || 0);
        const tb = new Date(b.timestamp || 0);
        return tb - ta;
      });
      setSignals(sorted);
    } catch (err) {
      console.error("❌ Erreur chargement Firestore :", err);
      setSignals([]); // Fallback vide
    }
  };

  // 🚀 Initialisation
  useEffect(() => {
    loadSignals();
    fetchLogLines();
    const timer = setInterval(() => {
      loadSignals();
      fetchLogLines();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ████████ RENDU VISUEL ████████
  return (
    <div style={{
      backgroundImage: 'url("/backgrounds/homebackground.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: isDesktop ? "fixed" : "scroll",
      padding: "6rem 2rem 2rem",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>

      {/* 🧱 BARRE TITRE */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
        borderRadius: "6px",
        marginBottom: "1.5rem"
      }}>
        <h1>🚨 Signaux IA</h1>
      </div>

      {/* 🧾 LOGS CONSOLE */}
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

      {/* 📊 BLOC SIGNAUX */}
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
                {/* 🧠 HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{s.crypto || "—"}</div>
                  <div style={{ color: "#ccc", fontSize: "1rem" }}>🧠 {s.type_ia || s.type || "inconnu"}</div>
                  <div style={{ color: getRiskColor(s.risk), fontSize: "1rem" }}>
                    Risque : {s.risk || "—"}
                  </div>
                </div>

                {/* 📊 SCORE */}
                <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "0.3rem" }}>
                  📊 Score IA : {fmt(s.score)} / 5
                  {s.score20 !== undefined && ` | Score global : ${fmt(s.score20)} / 20`}
                  <br />
                  🕒 {new Date(s.timestamp).toLocaleString()}
                </div>

                {/* 📋 EXPLICATIONS */}
                {Array.isArray(s.explanation) && (
                  <ul style={{
                    marginTop: "0.5rem",
                    color: "#ddd",
                    fontSize: "0.95rem",
                    lineHeight: "1.4",
                    paddingLeft: "1.2rem"
                  }}>
                    {s.explanation.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                )}

                {/* 🔗 TRADINGVIEW */}
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