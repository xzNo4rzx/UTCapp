// src/pages/Trading.jsx
const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
import React, { useEffect, useState, useContext } from "react";
import fetchPrices from "../utils/fetchPrices";
import { PortfolioContext } from "../context/PortfolioContext";

const Trading = () => {
  const { portfolio = {}, buy, sell, reset } = useContext(PortfolioContext);
  const positions = portfolio.positions || {};

  const [top5Up, setTop5Up]         = useState([]);
  const [top5Down, setTop5Down]     = useState([]);
  const [cryptos, setCryptos]       = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [sellModal, setSellModal]     = useState(false);
  const [sellSymbol, setSellSymbol]   = useState("");
  const [sellPrice, setSellPrice]     = useState(0);
  const [sellPercent, setSellPercent] = useState(100);

  // Ouvre la fenêtre de vente avec slider %
  const openSell = (symbol, price) => {
    setSellSymbol(symbol);
    setSellPrice(price);
    setSellPercent(100);
    setSellModal(true);
  };

  // Confirme la vente
  const confirmSell = () => {
    const pos = positions[sellSymbol] || { amount: 0 };
    const totalValue = pos.amount * sellPrice;
    const amountUsd  = (sellPercent / 100) * totalValue;
    sell(sellSymbol, sellPrice, amountUsd);
    setSellModal(false);
  };

  // Fetch + fusion + déduplication
  const updatePrices = async () => {
    try {
      const { top5Up: up, top5Down: down, rest } = await fetchPrices();
      const now = new Date().toLocaleTimeString();
      setTop5Up(up);
      setTop5Down(down);

      const combined = [...up, ...down, ...rest];
      const mapBySymbol = new Map();
      combined.forEach((c) => mapBySymbol.set(c.symbol, c));
      setCryptos(Array.from(mapBySymbol.values()));

      setLastUpdate(now);
    } catch (err) {
      console.error("Erreur fetchPrices :", err);
    }
  };

  useEffect(() => {
    updatePrices();
    const iv = setInterval(updatePrices, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Tri custom
  const knownOrder = ["BTC","ETH","USDT","BNB","ADA","SOL","XRP","DOT","DOGE","MATIC"];
  const sortedCryptos = useMemo(() =>
    [...cryptos].sort((a, b) => {
      const ia = knownOrder.indexOf(a.symbol) !== -1 ? knownOrder.indexOf(a.symbol) : knownOrder.length;
      const ib = knownOrder.indexOf(b.symbol) !== -1 ? knownOrder.indexOf(b.symbol) : knownOrder.length;
      if (ia !== ib) return ia - ib;
      return a.symbol.localeCompare(b.symbol);
    }),
  [cryptos]);

  // Styles & helpers
  const cellStyle = {
    textAlign: "center",
    padding: "8px",
    border: "1px solid #444",
    color: "#ccc",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
  };
  const rowStyle = (i) => ({
    backgroundColor: i % 2 === 0 ? "#1e1e1e" : "#252525",
  });
  const fmt2 = (v) => (typeof v === "number" ? v.toFixed(2) : "0.00");

  // Portefeuille
  const cash              = portfolio.cash              ?? 0;
  const invested          = portfolio.invested          ?? 0;
  const pnlPercent        = portfolio.pnlPercent        ?? 0;
  const cumulativeUsd     = portfolio.cumulativeUsd     ?? 0;
  const cumulativePercent = portfolio.cumulativePercent ?? 0;

  // Achat rapide
  const handleBuy = (symbol, price) => {
    const input = window.prompt(`USD à investir dans ${symbol} :`, "0");
    const amt = parseFloat(input);
    if (amt > 0) buy(symbol, price, amt);
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", minHeight: "100vh" }}>
      <h1 style={{ color: "#fff", marginBottom: "1rem", fontFamily: "sans-serif" }}>
        🪙 Trading
      </h1>

      {/* Récap */}
      <div style={{ color: "#fff", marginBottom: "1.5rem", fontFamily: "sans-serif" }}>
        <strong>Portefeuille :</strong>&nbsp;
        Cash ${cash.toFixed(2)}&nbsp;&nbsp;
        Investi ${invested.toFixed(2)}&nbsp;&nbsp;
        P&L inv {pnlPercent.toFixed(2)}%&nbsp;&nbsp;
        P&L tot ${cumulativeUsd.toFixed(2)} ({cumulativePercent.toFixed(2)}%)
      </div>

      {/* Actions */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={updatePrices}
          style={{
            marginRight: "1rem",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Mettre à jour
        </button>
        <button
          onClick={() => { reset(); alert("Portefeuille réinitialisé à 10 000 $"); }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 RESET
        </button>
      </div>

      {/* Last update */}
      {lastUpdate && (
        <div style={{ color: "#888", marginBottom: "2rem", fontFamily: "sans-serif" }}>
          Dernière mise à jour : {lastUpdate}
        </div>
      )}

      {/* Top5 hausses */}
      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>📈 Top 5 hausses (5 min)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <thead>
          <tr>
            {["Crypto","Prix","Var","Achat","Vente"].map((h) => (
              <th key={h} style={{ ...cellStyle, color: "#fff" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top5Up.map((c, i) => {
            const price = c.currentPrice ?? 0;
            const change = c.changePercent ?? 0;
            const hasPos = (positions[c.symbol]?.amount ?? 0) > 0;
            return (
              <tr key={`${c.symbol}-up`} style={rowStyle(i)}>
                <td style={cellStyle}>{c.symbol}</td>
                <td style={cellStyle}>${price.toFixed(4)}</td>
                <td
                  style={{
                    ...cellStyle,
                    color: change >= 0 ? "lightgreen" : "salmon",
                  }}
                >
                  {fmt2(change)}%
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => handleBuy(c.symbol, price)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    ACHAT
                  </button>
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => openSell(c.symbol, price)}
                    disabled={!hasPos}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: hasPos ? "#dc3545" : "#555",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: hasPos ? "pointer" : "not-allowed",
                      fontSize: "0.9rem",
                    }}
                  >
                    VENTE
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Top5 baisses */}
      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>📉 Top 5 baisses (5 min)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <thead>
          <tr>
            {["Crypto","Prix","Var","Achat","Vente"].map((h) => (
              <th key={h} style={{ ...cellStyle, color: "#fff" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top5Down.map((c, i) => {
            const price = c.currentPrice ?? 0;
            const change = c.changePercent ?? 0;
            const hasPos = (positions[c.symbol]?.amount ?? 0) > 0;
            return (
              <tr key={`${c.symbol}-down`} style={rowStyle(i)}>
                <td style={cellStyle}>{c.symbol}</td>
                <td style={cellStyle}>${price.toFixed(4)}</td>
                <td
                  style={{
                    ...cellStyle,
                    color: change >= 0 ? "lightgreen" : "salmon",
                  }}
                >
                  {fmt2(change)}%
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => handleBuy(c.symbol, price)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    ACHAT
                  </button>
                </td>
                <td style={cellStyle}>
                  <button
                    onClick={() => openSell(c.symbol, price)}
                    disabled={!hasPos}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: hasPos ? "#dc3545" : "#555",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: hasPos ? "pointer" : "not-allowed",
                      fontSize: "0.9rem",
                    }}
                  >
                    VENTE
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Autres cryptos */}
      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>🧾 Autres cryptos</h2>
      {cryptos.length === 0 ? (
        <p style={{ color: "#ccc" }}>Chargement des cryptos…</p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table style={{ minWidth: "900px", width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Crypto","Prix","5 min","10 min","15 min","1 h","4 h","24 h",
                  "Lien","Achat","Vente"
                ].map((h) => (
                  <th key={h} style={{ ...cellStyle, color: "#fff" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCryptos.map((c, i) => {
                const price = c.currentPrice ?? 0;
                return (
                  <tr key={c.symbol} style={rowStyle(i)}>
                    <td style={cellStyle}>{c.symbol}</td>
                    <td style={cellStyle}>${price.toFixed(4)}</td>
                    <td style={{ ...cellStyle, color: c.changePercent  >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.changePercent)}%
                    </td>
                    <td style={{ ...cellStyle, color: c.change10min   >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.change10min)}%
                    </td>
                    <td style={{ ...cellStyle, color: c.change15min   >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.change15min)}%
                    </td>
                    <td style={{ ...cellStyle, color: c.change1h      >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.change1h)}%
                    </td>
                    <td style={{ ...cellStyle, color: c.change4h      >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.change4h)}%
                    </td>
                    <td style={{ ...cellStyle, color: c.change24h     >= 0 ? "lightgreen" : "salmon" }}>
                      {fmt2(c.change24h)}%
                    </td>
                    <td style={cellStyle}>
                      <a
                        href={`https://www.tradingview.com/symbols/${c.symbol}USD`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#4ea8de", textDecoration: "none" }}
                      >
                        →
                      </a>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleBuy(c.symbol, price)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        ACHAT
                      </button>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => openSell(c.symbol, price)}
                        disabled={!(positions[c.symbol]?.amount > 0)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: positions[c.symbol]?.amount > 0 ? "#dc3545" : "#555",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: positions[c.symbol]?.amount > 0 ? "pointer" : "not-allowed",
                          fontSize: "0.9rem",
                        }}
                      >
                        VENTE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sellModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: "#222",
              padding: "2rem",
              borderRadius: "8px",
              color: "#fff",
              minWidth: "320px"
            }}
          >
            <h2>Vendre {sellSymbol}</h2>
            {(() => {
              const pos       = positions[sellSymbol] || { amount: 0, entryPrice: 0 };
              const qty       = pos.amount ?? 0;
              const entry     = pos.entryPrice ?? 0;
              const totalBuy  = entry * qty;
              const currentVal= sellPrice * qty;
              const fullPct   = qty > 0 ? ((sellPrice - entry) / entry) * 100 : 0;
              const fullUsd   = (sellPrice - entry) * qty;
              const selUsd    = (sellPercent / 100) * currentVal;
              const profitSel = (sellPercent / 100) * fullUsd;
              return (
                <div style={{ marginBottom: "1rem" }}>
                  <p>Achat : {qty.toFixed(4)} × ${entry.toFixed(4)} = ${totalBuy.toFixed(2)}</p>
                  <p>Actuel: {qty.toFixed(4)} × ${sellPrice.toFixed(4)} = ${currentVal.toFixed(2)}</p>
                  <p>Gain pot. : ${fullUsd.toFixed(2)} ({fullPct.toFixed(2)}%)</p>
                  <p>% vendu : {sellPercent}% → ${selUsd.toFixed(2)}, gain ${profitSel.toFixed(2)}</p>
                </div>
              );
            })()}
            <div style={{ margin: "1rem 0" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                % à vendre : {sellPercent}%
              </label>
              <input
                type="range"
                min="1" max="100"
                value={sellPercent}
                onChange={(e) => setSellPercent(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <button
              onClick={() => setSellPercent(100)}
              style={{
                marginBottom: "1rem",
                padding: "6px 12px",
                backgroundColor: "#666",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Max
            </button>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setSellModal(false)}
                style={{
                  marginRight: "1rem",
                  padding: "6px 12px",
                  backgroundColor: "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmSell}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Vendre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trading;