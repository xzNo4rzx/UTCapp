import React from "react";

const SellModalIA = ({
  show,
  symbol,
  price,
  percent,
  onChangePercent,
  onSetMax,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        backgroundColor: "#222",
        padding: "2rem",
        borderRadius: "8px",
        maxWidth: "400px",
        width: "90%",
        color: "#fff"
      }}>
        <h2>💣 Vente IA : {symbol}</h2>
        <p>💰 Prix actuel : ${price.toFixed(4)}</p>

        <label htmlFor="percent">📉 Pourcentage à vendre :</label>
        <input
          id="percent"
          type="range"
          min="1"
          max="100"
          value={percent}
          onChange={onChangePercent}
          style={{ width: "100%", margin: "0.5rem 0" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
          <span>{percent}%</span>
          <button onClick={onSetMax} style={{
            backgroundColor: "#4ea8de",
            border: "none",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#fff"
          }}>MAX</button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
          <button onClick={onClose} style={{
            padding: "6px 12px", backgroundColor: "#888", color: "#fff",
            border: "none", borderRadius: "4px", cursor: "pointer"
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff",
            border: "none", borderRadius: "4px", cursor: "pointer"
          }}>VENDRE</button>
        </div>
      </div>
    </div>
  );
};

export default SellModalIA;