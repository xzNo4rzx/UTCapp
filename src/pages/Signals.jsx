// FICHIER: src/pages/Signals.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiLatestSignals, apiTickSignals } from "../utils/api";

const REFRESH_MS = 10_000; // refresh doux

function fmtTs(ts) {
  try {
    if (!ts) return "—";
    const d = new Date(ts);
    if (!isFinite(d)) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

export default function Signals() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null);
    try {
      // tick léger (lit /trader-log) pour “réveiller” la pipeline si tu l’utilises
      apiTickSignals().catch(() => {});
      const arr = await apiLatestSignals(200);
      if (Array.isArray(arr)) setItems(arr);
      else setItems([]);
    } catch (e) {
      console.error("[Signals] load err", e);
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const content = useMemo(() => {
    if (loading) return <div style={{ padding: 12 }}>Chargement…</div>;
    if (err) return <div style={{ padding: 12, color: "crimson" }}>Erreur: {err}</div>;
    if (!items.length) {
      return (
        <div style={{ padding: 12 }}>
          <h2>Signals</h2>
          <div style={{ marginTop: 8, opacity: 0.8 }}>
            Aucun signal pour le moment. Si tu t’attends à en voir, vérifie la
            production du fichier <code>data/signals.json</code> côté API (voir § 2).
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: 12 }}>
        <h2>Signals ({items.length})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Symbol</th>
              <th style={th}>Side</th>
              <th style={th}>Price</th>
              <th style={th}>Confidence</th>
              <th style={th}>Meta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s, i) => (
              <tr key={i}>
                <td style={td}>{fmtTs(s.ts || s.time || s.timestamp)}</td>
                <td style={td}>{String(s.symbol || s.pair || "—")}</td>
                <td style={td}>{String(s.side || s.action || "—")}</td>
                <td style={td}>
                  {typeof s.price === "number" ? s.price : s.price ?? "—"}
                </td>
                <td style={td}>
                  {typeof s.confidence === "number" ? `${(s.confidence*100).toFixed(0)}%` : (s.confidence ?? "—")}
                </td>
                <td style={td}>
                  <pre style={pre}>
                    {JSON.stringify(
                      {
                        ...s,
                        ts: undefined,
                        time: undefined,
                        timestamp: undefined,
                        symbol: undefined,
                        pair: undefined,
                        side: undefined,
                        action: undefined,
                        price: undefined,
                        confidence: undefined,
                      },
                      null,
                      2
                    )}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [items, err, loading]);

  return content;
}

const th = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px 6px",
  fontWeight: 600,
};
const td = {
  borderBottom: "1px solid #eee",
  padding: "8px 6px",
  verticalAlign: "top",
};
const pre = {
  margin: 0,
  whiteSpace: "pre-wrap",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12,
  opacity: 0.9,
};