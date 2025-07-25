import React, { useContext, useEffect } from "react";
import { IATraderContext } from "../context/IATraderContext";

const IATrader = () => {
  const {
    iaName,
    cash,
    positions,
    history,
    currentPrices,
    updatePrices,
  } = useContext(IATraderContext);

  useEffect(() => {
    updatePrices();
  }, [positions]);

  const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : "-");

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
      <h1>🤖 IA Trader : {iaName}</h1>
      <div style={{ marginBottom: "1rem" }}>
        <strong>Cash :</strong> ${fmt(cash)} |{" "}
        <strong>Positions :</strong> {positions.length} |{" "}
        <strong>Historique :</strong> {history.length} trades
      </div>
      <button
        onClick={updatePrices}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔄 Update Prices
      </button>
    </div>
  );
};

export default IATrader;