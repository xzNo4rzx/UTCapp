import React, { useEffect, useState } from "react";

const LogViewer = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("https://utc-ai-signal-api.onrender.com/trader-log");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const lines = text.split("\n").filter(Boolean).reverse(); // Derniers logs d'abord
        setLogs(lines);
      } catch (err) {
        setLogs([`❌ Erreur chargement logs : ${err.message}`]);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#111",
      padding: "1rem",
      color: "#0f0",
      fontFamily: "monospace",
      maxHeight: "300px",
      overflowY: "auto",
      border: "1px solid #333",
      borderRadius: "8px"
    }}>
      <h3 style={{ color: "#4ea8de" }}>📋 Journal IA Trader (auto-refresh)</h3>
      {logs.map((line, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap" }}>{line}</div>
      ))}
    </div>
  );
};

export default LogViewer;