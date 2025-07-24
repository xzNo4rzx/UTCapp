import React from "react";

const SellModal = ({ show, symbol, price, percent, positions, onClose, onConfirm, onChangePercent, onSetMax }) => {
  if (!show) return null;

  const position = positions.find((p) => p.symbol === symbol);
  const current = price ?? 0;
  const initial = position?.buyPrice ?? 0;
  const amount = position?.quantity ?? 0;
  const valueNow = (current * amount).toFixed(2);
  const valueThen = (initial * amount).toFixed(2);
  const pnl = (current - initial) * amount;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0009", zIndex: 999 }}>
      <div style={{ backgroundColor: "#1e1e1e", margin: "10% auto", padding: "2rem", borderRadius: "8px", maxWidth: "500px", color: "#fff" }}>
        <h3>Vendre {symbol}</h3>
        <p>Investi : ${valueThen} — Valeur actuelle : ${valueNow}</p>
        <p style={{ color: pnl >= 0 ? "lightgreen" : "salmon" }}>P&L : ${pnl.toFixed(2)}</p>

        <label>Pourcentage à vendre : {percent}%</label>
        <input
          type="range"
          min="1"
          max="100"
          value={percent}
          onChange={onChangePercent}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
          <button onClick={onSetMax} style={{ padding: "8px 12px", backgroundColor: "#555", color: "#fff", border: "none" }}>MAX</button>
          <button onClick={onClose} style={{ padding: "8px 12px", backgroundColor: "#999", color: "#fff", border: "none" }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none" }}>VENDRE</button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
