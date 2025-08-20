// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Petite util
const up = (s) => String(s || "").toUpperCase().trim();
const fmt = (n, d = 2) =>
  Number.isFinite(n) ? Number(n).toFixed(d) : "—";

const DEFAULT_LIST = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX",
  "DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC",
  "FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE",
  "PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX",
  "STX","ENS","CRV","HBAR","CRO"
];

export default function Trading() {
  const [symbols, setSymbols] = useState(DEFAULT_LIST);
  const [prices, setPrices]   = useState({}); // {SYM: price}
  const [deltas, setDeltas]   = useState({}); // {SYM: { '1m': x, '5m': y, ... }}
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = async () => {
    try {
      setErr("");
      const syms = symbols.map(up);
      // 1) prix
      const mp = await apiGetPrices(syms);
      // 2) deltas (on veut 5m pour la table)
      const { deltas: d, updatedAt: upAt } = await apiDeltas(syms, ["5m"]);
      setPrices(mp || {});
      setDeltas(d || {});
      setUpdatedAt(upAt || new Date().toISOString());
      setLoading(false);
    } catch (e) {
      console.error("[Trading] fetchAll error:", e);
      setErr(e?.message || "Erreur de chargement");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();                 // premier load
    const iv = setInterval(fetchAll, 30_000); // refresh 30s
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  const rows = useMemo(() => {
    return symbols.map(s => {
      const sym = up(s);
      const p   = prices?.[sym];
      const d5  = deltas?.[sym]?.["5m"];
      return { symbol: sym, price: p, d5 };
    });
  }, [symbols, prices, deltas]);

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: 8 }}>Trading — Watchlist</h2>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>
        {updatedAt ? `Dernière mise à jour: ${new Date(updatedAt).toLocaleString()}` : "—"}
      </div>

      {err ? (
        <div style={{ color: "red", marginBottom: 12 }}>
          {err}
        </div>
      ) : null}

      {loading ? (
        <div>Chargement…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr>
                <th style={th}>Symbole</th>
                <th style={th}>Prix</th>
                <th style={th}>Δ 5m</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol}>
                  <td style={td}>{r.symbol}</td>
                  <td style={td}>{fmt(r.price, 6)}</td>
                  <td style={{ ...td, color: colorDelta(r.d5) }}>
                    {Number.isFinite(r.d5) ? `${fmt(r.d5, 2)} %` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* (optionnel) petite barre d’actions */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={fetchAll}>Rafraîchir</button>
        <button
          onClick={() => {
            const s = prompt("Ajouter un symbole (ex: BTC)");
            if (s) setSymbols(prev => Array.from(new Set([...prev, up(s)])));
          }}
        >
          + Ajouter symbole
        </button>
      </div>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" };
const td = { borderBottom: "1px solid #eee", padding: "8px" };

function colorDelta(v) {
  if (!Number.isFinite(v)) return "#555";
  if (v > 0) return "#0a8f2b";
  if (v < 0) return "#c62828";
  return "#555";
}