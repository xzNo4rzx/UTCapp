import React from "react";

const formatPrice = (value) => {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
};

const CryptoList = ({ cryptos, positions, onBuy, onOpenSell }) => {
  return (
    <div>
      <h3 style={{ color: "#fff" }}>🧾 Autres cryptos</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px" }}>Symbole</th>
              <th style={{ textAlign: "left", padding: "6px" }}>Prix</th>
              <th style={{ textAlign: "left", padding: "6px" }}>Variation (5min)</th>
              <th style={{ textAlign: "left", padding: "6px" }}>Achat</th>
              <th style={{ textAlign: "left", padding: "6px" }}>Vente</th>
              <th style={{ textAlign: "left", padding: "6px" }}>TradingView</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((c, i) => {
              const hasPosition = positions?.some((p) => p.symbol === c.symbol && p.quantity > 0);
              return (
                <tr key={c.symbol} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                  <td style={{ padding: "6px", color: "#fff" }}>{c.symbol}</td>
                  <td style={{ padding: "6px", color: "#ccc" }}>${formatPrice(c.currentPrice)}</td>
                  <td style={{ padding: "6px", color: c.changePercent >= 0 ? "lightgreen" : "salmon" }}>
                    {c.changePercent?.toFixed(2)}%
                  </td>
                  <td>
                    <button onClick={() => onBuy(c.symbol, c.currentPrice)}>ACHAT</button>
                  </td>
                  <td>
                    <button
                      onClick={() => onOpenSell(c.symbol, c.currentPrice)}
                      disabled={!hasPosition}
                      style={{ backgroundColor: hasPosition ? "#dc3545" : "#555", color: "#fff", padding: "4px 8px" }}
                    >
                      VENTE
                    </button>
                  </td>
                  <td>
                    <a
                      href={`https://www.tradingview.com/symbols/${c.symbol}USD`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#4ea8de", fontWeight: "bold", textDecoration: "none" }}
                    >
                      →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;