import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/config.js";

// Liste cohérente avec les appels existants (41 tickers)
const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT","MATIC","LTC","BCH",
  "UNI","LINK","XLM","ATOM","ETC","FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT",
  "RUNE","PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX","STX","ENS","CRV",
  "HBAR","CRO"
];

function usePrices(symbols) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const csv = useMemo(() => symbols.join(","), [symbols]);

  async function fetchOnce() {
    try {
      setErr("");
      const url = `${API_BASE_URL}/prices?symbols=${encodeURIComponent(csv)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setMap(data?.prices || {});
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOnce(); // 1ère récupération
    const id = setInterval(fetchOnce, 10000); // refresh 10s
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csv]);

  return { map, loading, err };
}

export default function TradingTiles() {
  const symbols = DEFAULT_SYMBOLS; // pourra être remplacé par préférences utilisateur
  const { map, loading, err } = usePrices(symbols);

  return (
    <div style={{ padding: "12px 16px" }}>
      <header style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>Marché (UTC)</h2>
        <small style={{ opacity: 0.7 }}>
          API: {API_BASE_URL.replace(/^https?:\/\//,"")}
        </small>
      </header>

      {err && (
        <div style={{
          background: "#ffe9e9",
          color: "#a40000",
          border: "1px solid #f3c5c5",
          padding: "8px 10px",
          borderRadius: 6,
          marginBottom: 12
        }}>
          Erreur chargement prix : {err}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 12
        }}
      >
        {symbols.map((sym) => (
          <Tile
            key={sym}
            symbol={sym}
            price={map?.[sym]}
            loading={loading && !(sym in map)}
          />
        ))}
      </div>
    </div>
  );
}

function Tile({ symbol, price, loading }) {
  // placeholders variations (seront branchées quand l’API renverra les deltas serveur)
  const vars = {
    "1m": null, "5m": null, "10m": null, "1h": null, "6h": null, "1d": null, "7d": null
  };

  return (
    <div
      style={{
        border: "1px solid #e7e7e7",
        borderRadius: 10,
        padding: 12,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 120
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong>{symbol}/USDT</strong>
        <small style={{ opacity: 0.6 }}>{loading ? "chargement…" : "live"}</small>
      </div>

      <div style={{ fontSize: 22, fontWeight: 600 }}>
        {price != null ? formatUSD(price) : "—"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {Object.entries(vars).map(([k, v]) => (
          <VarChip key={k} label={k} value={v} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <button style={btnStyle} disabled>Acheter</button>
        <button style={btnGhostStyle} disabled>Vendre</button>
      </div>
    </div>
  );
}

function VarChip({ label, value }) {
  const color = value == null ? "#bbb" : value >= 0 ? "green" : "crimson";
  const text  = value == null ? "—" : (value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`);

  return (
    <div
      title={label}
      style={{
        border: "1px dashed #e0e0e0",
        borderRadius: 8,
        padding: "4px 6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 6,
        fontSize: 12
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <strong style={{ color }}>{text}</strong>
    </div>
  );
}

function formatUSD(n) {
  try {
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (n >= 1)    return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  } catch {
    return String(n);
  }
}

const btnStyle = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #1a73e8",
  background: "#1a73e8",
  color: "#fff",
  cursor: "not-allowed",
  fontWeight: 600
};

const btnGhostStyle = {
  ...btnStyle,
  border: "1px solid #d0d0d0",
  background: "#f6f6f6",
  color: "#333"
};
