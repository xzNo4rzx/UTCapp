import React from "react";

const formatPrice = (value) => {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
};

const formatPercent = (value) => {
  const fixed = value?.toFixed(2);
  const color = value >= 0 ? "lightgreen" : "salmon";
  return <span style={{ color }}>{fixed}%</span>;
};

const CryptoList = ({ cryptos, positions, onBuy, onOpenSell }) => {
  return (
    <div>
      <h3 style={{ color: "#fff" }}>🧾 Autres cryptos</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "#fff" }}>
              <th style={{ padding: "6px" }}>Symbole</th>
              <th style={{ padding: "6px" }}>Prix</th>
              <th style={{ padding: "6px" }}>5min</th>
              <th style={{ padding: "6px" }}>1j</th>
              <th style={{ padding: "6px" }}>7j</th>
              <th style={{ padding: "6px" }}>Achat</th>
              <th style={{ padding: "6px" }}>Vente</th>
              <th style={{ padding: "6px" }}>TradingView</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((c, i) => {
              const hasPosition = positions?.some((p) => p.symbol === c.symbol && p.quantity > 0);
              return (
                <tr key={c.symbol} style={{ backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525" }}>
                  <td style={{ padding: "6px", color: "#fff" }}>{c.symbol}</td>
                  <td style={{ padding: "6px", color: "#ccc" }}>${formatPrice(c.currentPrice)}</td>
                  <td style={{ padding: "6px" }}>{formatPercent(c.change5min)}</td>
                  <td style={{ padding: "6px" }}>{formatPercent(c.change1d)}</td>
                  <td style={{ padding: "6px" }}>{formatPercent(c.change7d)}</td>
                  <td style={{ padding: "6px" }}>
                    <button onClick={() => onBuy(c.symbol, c.currentPrice)}>ACHAT</button>
                  </td>
                  <td style={{ padding: "6px" }}>
                    <button
                      onClick={() => onOpenSell(c.symbol, c.currentPrice)}
                      disabled={!hasPosition}
                      style={{
                        backgroundColor: hasPosition ? "#dc3545" : "#555",
                        color: "#fff",
                        padding: "4px 8px",
                        border: "none",
                        borderRadius: "4px"
                      }}
                    >
                      VENTE
                    </button>
                  </td>
                  <td style={{ padding: "6px" }}>
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