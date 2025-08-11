import React, { useContext, useMemo, useState, useEffect } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import TopMovers from "../components/TopMovers";
import "../styles/trading.css";

const ORDER = ["BTC","ETH","USDT","BNB","ADA","SOL","XRP","DOT","DOGE","MATIC"];

function fmtUSD(n) {
  if (n == null) return "—";
  return n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : n.toFixed(2);
}
function fmtPct(x) {
  if (x == null) return "—";
  const v = Number.isFinite(x) ? x : null;
  if (v == null) return "—";
  const abs = Math.abs(v) < 0.01 ? v.toFixed(3) : v.toFixed(2);
  return `${abs}%`;
}
function Chip({ k, v }) {
  const cls = v == null ? "neutral" : v > 0 ? "up" : v < 0 ? "down" : "neutral";
  return (
    <div className="tr-chip">
      <span className="k">{k}</span>
      <span className={`v ${cls}`}>{fmtPct(v)}</span>
    </div>
  );
}
function Row({ sym, price, deltas, hasPos, onBuy, onSell }) {
  return (
    <li className="tr-row">
      <div className="tr-sym">
        <span className="code">{sym}</span>
        <a href={`https://www.tradingview.com/symbols/${sym}USD`} target="_blank" rel="noreferrer" className="pair">→ TV</a>
      </div>
      <div className="tr-price">{price != null ? `$${fmtUSD(price)}` : "—"}</div>
      <div className="tr-vars">
        <Chip k="1m"  v={deltas["1m"]} />
        <Chip k="5m"  v={deltas["5m"]} />
        <Chip k="10m" v={deltas["10m"]} />
        <Chip k="1h"  v={deltas["1h"]} />
        <Chip k="6h"  v={deltas["6h"]} />
        <Chip k="1d"  v={deltas["1d"]} />
        <Chip k="7d"  v={deltas["7d"]} />
      </div>
      <div className="tr-actions">
        <button className="tr-btn buy" onClick={() => onBuy(sym, price)} disabled={!price}>Acheter</button>
        <button className="tr-btn sell" onClick={() => onSell(sym, price)} disabled={!hasPos || !price}>Vendre</button>
      </div>
    </li>
  );
}

export default function Trading() {
  const {
    cash, positions, currentPrices, lastUpdated,
    buyPosition, sellPosition, resetPortfolio, updatePrices, getDeltas
  } = useContext(PortfolioContext);

  useEffect(() => { updatePrices(); }, []);

  const symbols = useMemo(() => {
    const arr = Object.keys(currentPrices || {});
    arr.sort((a, b) => {
      const ia = ORDER.indexOf(a); const ib = ORDER.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.localeCompare(b);
    });
    return arr;
  }, [currentPrices]);

  const [sellSym, setSellSym] = useState(null);
  const [sellPct, setSellPct] = useState(100);
  const [sellPrice, setSellPrice] = useState(null);

  function onBuy(sym, price) {
    const v = window.prompt(`USD à investir dans ${sym} :`, "0");
    const amt = parseFloat(v || "0");
    if (amt > 0 && price) buyPosition(sym, amt);
  }
  function onSell(sym, price) {
    setSellSym(sym);
    setSellPct(100);
    setSellPrice(price);
  }
  function confirmSell() {
    const pos = positions.find(p => (p.symbol||"").toUpperCase() === sellSym);
    if (!pos || !sellPrice) { setSellSym(null); return; }
    const usdMax = pos.qty * sellPrice;
    const usd = (sellPct / 100) * usdMax;
    if (usd > 0) sellPosition(sellSym, sellPct, sellPrice);
    setSellSym(null);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: 'url("/backgrounds/homebackground.png")', backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="tr-wrap" style={{ paddingTop: "80px" }}>
        <div className="tr-header">
          <h2 style={{ margin: 0 }}>💸 Trading</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(140px, 1fr))", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.18)" }}>
            Cash ${fmtUSD(cash)}
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.18)" }}>
            Valeur totale ${fmtUSD(positions.reduce((s,p)=>s+(p.qty*(currentPrices[(p.symbol||"").toUpperCase()]||0)), cash))}
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.18)" }}>
            P&L %
          </div>
          <button onClick={updatePrices} className="tr-btn buy" style={{ cursor: "pointer" }}>Mettre à jour</button>
          <button onClick={resetPortfolio} className="tr-btn sell" style={{ cursor: "pointer" }}>RESET PT</button>
        </div>

        <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
          Dernière mise à jour: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"} • Variations basées sur l’historique interne alimenté par les prix du backend
        </div>

        <div style={{ margin: "10px 0 18px 0" }}>
          <TopMovers />
        </div>

        {symbols.length === 0 ? (
          <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)" }}>
            Aucune donnée pour le moment. Clique sur “Mettre à jour” pour rafraîchir depuis l’API.
          </div>
        ) : (
          <ul className="tr-list">
            {symbols.map(sym => (
              <Row
                key={sym}
                sym={sym}
                price={currentPrices[sym]}
                deltas={getDeltas(sym) || {}}
                hasPos={positions.some(p => (p.symbol||"").toUpperCase()===sym && p.qty>0)}
                onBuy={onBuy}
                onSell={onSell}
              />
            ))}
          </ul>
        )}

        {sellSym && (
          <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "min(520px, 92vw)", background: "#1f1f1f", borderRadius: 8, color: "#fff", padding: "1.25rem 1.25rem 1rem" }}>
              <h3 style={{ marginTop: 0 }}>Vendre {sellSym}</h3>
              <div style={{ margin: "8px 0" }}>
                <label style={{ display: "block", marginBottom: 6 }}>% à vendre : {sellPct}%</label>
                <input type="range" min={1} max={100} value={sellPct} onChange={e => setSellPct(Number(e.target.value))} style={{ width: "100%" }} />
                <button onClick={() => setSellPct(100)} style={{ marginTop: 8, padding: "6px 10px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Max</button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setSellSym(null)} style={{ padding: "8px 12px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Annuler</button>
                <button onClick={confirmSell} style={{ padding: "8px 12px", border: "none", borderRadius: 6, background: "#dc3545", color: "#fff", cursor: "pointer" }}>Vendre</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}