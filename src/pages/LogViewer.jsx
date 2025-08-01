import React, { useEffect, useState } from "react";

const LogViewer = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("https://utc-ai-signal-api.onrender.com/utcapp/trader-log");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(data.log || []);
    } catch (err) {
      console.error("❌ Erreur chargement logs :", err);
      setLogs([`❌ Erreur chargement logs : ${err.message}`]);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000); // ⏱️ Refresh toutes les 15s
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
      borderRadius: "8px",
      marginBottom: "2rem"
    }}>
      <h3 style={{ color: "#4ea8de" }}>📋 Journal IA Trader (auto-refresh)</h3>
      {logs.length === 0 ? (
        <p style={{ color: "#888" }}>Aucune entrée disponible...</p>
      ) : (
        logs.map((line, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>{line}</div>
        ))
      )}
    </div>
  );
};

export default LogViewer;