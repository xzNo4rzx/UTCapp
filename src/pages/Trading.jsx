// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Watchlist mini pour debug (mets ce que tu veux)
const DEFAULT_PAIRS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT",
];

const WINDOWS = ["1m", "5m", "1h"]; // on affiche 3 colonnes claires

function pctFmt(v) {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const s = n.toFixed(2) + "%";
  return n > 0 ? `+${s}` : s;
}

function priceFmt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  // prix crypto large -> 2 à 4 décimales selon taille
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(6);
}

export default function Trading() {
  const [pairs, setPairs] = useState(DEFAULT_PAIRS);
  const [prices, setPrices] = useState({});
  const [deltas, setDeltas] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // charge prix + deltas
  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const [pr, dl] = await Promise.all([
        apiGetPrices(pairs),
        apiDeltas(pairs, WINDOWS),
      ]);
      setPrices(pr || {});
      setDeltas((dl && dl.deltas) || {});
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.join("|")]);

  const rows = useMemo(() => {
    return pairs.map((sym) => {
      const p = prices[sym] ?? prices[sym.replace("/","")] ?? prices[sym.replace("USDT","")];
      const d = deltas[sym] || deltas[sym.replace("/","")] || deltas[sym.replace("USDT","")] || {};
      return { sym, price: p, d };
    });
  }, [pairs, prices, deltas]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Trading</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={load}>↻ Refresh</button>
        {loading && <span style={{ marginLeft: 8 }}>Chargement…</span>}
      </div>

      {err ? (
        <div style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {err}
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={th}>Pair</th>
              <th style={th}>Price</th>
              {WINDOWS.map((w) => (
                <th key={w} style={th}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ sym, price, d }) => (
              <tr key={sym}>
                <td style={td}>{sym}</td>
                <td style={td}>{priceFmt(price)}</td>
                {WINDOWS.map((w) => {
                  const val = d?.[w] ?? null;
                  const n = Number(val);
                  const color =
                    !Number.isFinite(n) ? "#999" : n > 0 ? "#0a0" : n < 0 ? "#c00" : "#999";
                  return (
                    <td key={w} style={{ ...td, color, fontWeight: 600 }}>
                      {pctFmt(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={2 + WINDOWS.length} style={{ ...td, color: "#999" }}>
                  Aucune paire.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 8, color: "#666" }}>
        Source: <code>{/* eslint-disable-next-line no-undef */ (window.__API_BASE__ || import.meta.env.VITE_API_BASE || "/api")}</code>
      </p>
    </div>
  );
}

const th = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px 10px",
};
const td = {
  borderBottom: "1px solid #eee",
  padding: "8px 10px",
};