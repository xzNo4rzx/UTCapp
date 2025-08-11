// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/trading.css";

const API = import.meta.env.VITE_API_BASE_URL || "https://utc-api.onrender.com";

const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT",
  "MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC","FIL","APT",
  "ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO",
  "RNDR","FTM","EGLD","FLOW","GRT","IMX","STX","ENS","CRV","HBAR","CRO"
];

function usePrices(symbols) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const csv = useMemo(() => symbols.join(","), [symbols]);

  async function fetchOnce() {
    try {
      const url = `${API}/prices?symbols=${encodeURIComponent(csv)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMap(data?.prices || {});
      setErr("");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOnce();
    const id = setInterval(fetchOnce, 10000);
    return () => clearInterval(id);
  }, [csv]);

  return { map, loading, err };
}

function VarChip({ k, v }) {
  const cls = v == null ? "neutral" : v >= 0 ? "up" : "down";
  const txt = v == null ? "—" : v >= 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`;
  return (
    <div className="tr-chip">
      <span className="k">{k}</span>
      <span className={`v ${cls}`}>{txt}</span>
    </div>
  );
}

function Row({ symbol, price, loading }) {
  const vars = { "1m": null, "5m": null, "10m": null, "1h": null, "6h": null, "1d": null, "7d": null };
  return (
    <li className="tr-row">
      <div className="tr-sym">
        <span className="sym">{symbol}</span>
        <span className="pair">/USDT</span>
      </div>
      <div className="tr-price">{price != null ? formatUSD(price) : loading ? "—" : "—"}</div>
      <div className="tr-vars">
        {Object.entries(vars).map(([k, v]) => (
          <VarChip key={k} k={k} v={v} />
        ))}
      </div>
      <div className="tr-actions">
        <button className="tr-btn buy" disabled>Acheter</button>
        <button className="tr-btn sell" disabled>Vendre</button>
      </div>
    </li>
  );
}

function formatUSD(n) {
  try {
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  } catch {
    return String(n);
  }
}

export default function Trading() {
  const symbols = DEFAULT_SYMBOLS;
  const { map, loading, err } = usePrices(symbols);

  return (
    <div className="tr-wrap">
      <div className="tr-header">
        <h2>Trading</h2>
        <span className="tr-note">1 ligne par crypto, fond verre dépoli, variations 1m/5m/10m/1h/6h/1d/7d</span>
      </div>

      {err && (
        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,0,0,0.08)" }}>
          Erreur chargement prix : {err}
        </div>
      )}

      <ul className="tr-list">
        {symbols.map((sym) => (
          <Row key={sym} symbol={sym} price={map?.[sym]} loading={loading} />
        ))}
      </ul>
    </div>
  );
}