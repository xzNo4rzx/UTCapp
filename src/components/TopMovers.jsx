import React from "react";

const TopMovers = ({ title, data, positions, onBuy, onOpenSell }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h3 style={{ color: "#fff" }}>{title}</h3>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Prix</th>
            <th>Variation (5min)</th>
            <th>Achat</th>
            <th>Vente</th>
            <th>TradingViewLink</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            const hasPosition = positions?.some((p) => p.symbol === c.symbol && p.quantity > 0);
            return (
              <tr key={c.symbol} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                <td style={{ padding: "8px", color: "#fff" }}>{c.symbol}</td>
                <td style={{ padding: "8px", color: "#ccc" }}>${c.currentPrice?.toFixed(4)}</td>
                <td style={{ padding: "8px", color: c.changePercent >= 0 ? "lightgreen" : "salmon" }}>
                  {c.changePercent.toFixed(2)}%
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
                <td style={{ textAlign: "center" }}>
                  <a
                    href={`https://www.tradingview.com/symbols/${c.symbol}USD`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0af", textDecoration: "none", fontSize: "1.2rem" }}
                  >
                    ➡️
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

export default TopMovers;