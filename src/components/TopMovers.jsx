// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/TopMovers.jsx

import React, { useContext, useMemo, useState, useEffect } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "./SellModal";
import { apiGetTopMovers } from "../utils/api";

const fmtPct = (n) =>
  typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(2)}%` : "—";
const fmtPrice = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};

const BuyModal = ({ show, symbol, amount, onChangeAmount, onClose, onConfirm }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
      <div style={{ width: "min(520px, 92vw)", margin: "10% auto", background: "#1f1f1f", borderRadius: 8, color: "#fff", padding: "1.25rem 1.25rem 1rem" }}>
        <h3 style={{ marginTop: 0 }}>ACHAT — {symbol}</h3>
        <label style={{ display: "block", marginBottom: 8 }}>Montant en USD</label>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333", background: "#121212", color: "#fff" }}
          placeholder="Ex: 1000"
        />
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmer l’achat</button>
        </div>
      </div>
    </div>
  );
};

const TopMovers = () => {
  const {
    currentPrices,
    positionsMap,
    buyPosition,
    sellPosition,
  } = useContext(PortfolioContext);

  const [showBuy, setShowBuy] = useState(false);
  const [buySymbol, setBuySymbol] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const [showSell, setShowSell] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPercent, setSellPercent] = useState(100);

  const positionsForModal = useMemo(() => {
    const rows = [];
    for (const list of Object.values(positionsMap || {})) {
      for (const p of list) rows.push({ ...p, quantity: p.qty });
    }
    return rows;
  }, [positionsMap]);

  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [lastTs, setLastTs] = useState(null);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      try {
        setLoadErr("");
        const data = await apiGetTopMovers();
        if (cancel) return;

        const gainers = Array.isArray(data?.gainers) ? data.gainers : [];
        const losers  = Array.isArray(data?.losers)  ? data.losers  : [];

        setTopGainers(gainers);
        setTopLosers(losers);
        setLastTs(data?.lastComputedAt || null);

        if ((gainers?.length ?? 0) === 0 && (losers?.length ?? 0) === 0) {
          console.warn("[TopMovers] API ok mais listes vides:", data);
        }
      } catch (e) {
        if (cancel) return;
        setLoadErr("Top Movers indisponibles pour le moment.");
        setTopGainers([]);
        setTopLosers([]);
      }
    };

    load();
    const iv = setInterval(load, 60_000);
    return () => { cancel = true; clearInterval(iv); };
  }, []);

  const openBuy = (sym) => {
    setBuySymbol(sym.toUpperCase());
    setBuyAmount("");
    setShowBuy(true);
  };
  const confirmBuy = async () => {
    const amt = Number(buyAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    await buyPosition(buySymbol, amt);
    setShowBuy(false);
  };

  const openSell = (sym) => {
    setSellSymbol(sym.toUpperCase());
    setSellPercent(100);
    setShowSell(true);
  };
  const confirmSell = async () => {
    await sellPosition(sellSymbol, sellPercent);
    setShowSell(false);
  };

  const hasOpen = (sym) => !!(positionsMap && positionsMap[(sym || "").toUpperCase()]);
  const tableWrapStyle = { overflowX: "auto", borderRadius: 8, border: "1px solid #2a2a2a" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: 620, color: "#fff" };
  const thStyle = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
  const tdStyle = { padding: "10px 12px", borderTop: "1px solid #2a2a2a" };

  const renderRows = (rows) =>
    rows.map((r, i) => {
      const sym = String(r?.symbol || "").toUpperCase();

      const price =
        Number.isFinite(r?.price) ? r.price :
        Number.isFinite(r?.currentPrice) ? r.currentPrice :
        currentPrices[sym] ?? NaN;

      const chg =
        Number.isFinite(r?.change5m) ? r.change5m :
        Number.isFinite(r?.change)   ? r.change   :
        Number.isFinite(r?.chg)      ? r.chg      : null;

      return (
        <tr key={`${sym}-${i}`} style={{ background: i % 2 ? "#222" : "#262626" }}>
          <td style={tdStyle}><b>{sym}</b></td>
          <td style={tdStyle}>{fmtPrice(price)}</td>
          <td style={{ ...tdStyle, color: typeof chg === "number" ? (chg >= 0 ? "lightgreen" : "salmon") : "#ddd" }}>
            {typeof chg === "number" ? fmtPct(chg) : "—"}
          </td>
          <td style={tdStyle}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => openBuy(sym)}
                style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}
              >
                ACHAT
              </button>
              {hasOpen(sym) && (
                <button
                  onClick={() => openSell(sym)}
                  style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  VENTE
                </button>
              )}
            </div>
          </td>
          <td style={tdStyle}>
            {hasOpen(sym) ? <span style={{ color: "#dc3545" }}>●</span> : <span style={{ color: "#888" }}>○</span>}
          </td>
          <td style={tdStyle}>
            <a
              href={`https://www.tradingview.com/symbols/${sym}USD`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#4ea8de", fontWeight: 700, textDecoration: "none" }}
            >
              →
            </a>
          </td>
        </tr>
      );
    });

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "baseline", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Top Movers (5m)</h2>
        <span style={{ color: "#aaa", fontSize: 12 }}>
          {lastTs ? `MAJ ${new Date(lastTs).toLocaleTimeString()}` : ""}
        </span>
      </div>

      {loadErr ? (
        <div style={{ background: "#2a2a2a", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 12, border: "1px solid #3a3a3a" }}>
          {loadErr}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#7ee787" }}>Hausses — 5 min</h4>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Crypto</th>
                  <th style={thStyle}>Prix (USD)</th>
                  <th style={thStyle}>Var 5m</th>
                  <th style={thStyle}></th>
                  <th style={thStyle}></th>
                  <th style={thStyle}>TD</th>
                </tr>
              </thead>
              <tbody>{renderRows(topGainers)}</tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <h4 style={{ margin: "0 0 8px 0", color: "#ff7b72" }}>Baisses — 5 min</h4>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Crypto</th>
                  <th style={thStyle}>Prix (USD)</th>
                  <th style={thStyle}>Var 5m</th>
                  <th style={thStyle}></th>
                  <th style={thStyle}></th>
                  <th style={thStyle}>TD</th>
                </tr>
              </thead>
              <tbody>{renderRows(topLosers)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <BuyModal
        show={showBuy}
        symbol={buySymbol}
        amount={buyAmount}
        onChangeAmount={setBuyAmount}
        onClose={() => setShowBuy(false)}
        onConfirm={confirmBuy}
      />

      <SellModal
        show={showSell}
        symbol={sellSymbol}
        price={currentPrices[(sellSymbol || "").toUpperCase()] ?? 0}
        percent={sellPercent}
        positions={positionsForModal}
        onClose={() => setShowSell(false)}
        onConfirm={confirmSell}
        onChangePercent={(e) => setSellPercent(Number(e.target.value))}
        onSetMax={() => setSellPercent(100)}
      />
    </div>
  );
};

export default TopMovers;