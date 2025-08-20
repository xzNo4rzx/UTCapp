// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Liste des paires qu'on affiche (modifiable)
const DEFAULT_SYMBOLS = [
  "BTCUSDT","ETHUSDT","SOLUSDT","XRPUSDT","ADAUSDT",
  "DOGEUSDT","AVAXUSDT","MATICUSDT"
];

// colonnes de variations à afficher
const WINDOWS = ["1m","5m","10m","1h","6h","1d","7d"];

function formatPrice(v) {
  if (v == null) return "—";
  if (v > 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
function formatPct(v) {
  if (v == null) return "—";
  const s = (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
  return s;
}

export default function Trading() {
  const [symbols] = useState(DEFAULT_SYMBOLS);
  const [prices, setPrices] = useState({});
  const [deltas, setDeltas] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function loadAll() {
    try {
      setErr(null);
      setLoading(true);
      const list = symbols.join(",");
      const [pr, dl] = await Promise.all([
        apiGetPrices(list),                    // { prices: {...} } ou {...}
        apiDeltas(list, WINDOWS.join(",")),    // { deltas: {...} } ou {...}
      ]);

      // tolère les deux formats côté API (payload “à plat” vs objet wrap)
      const p = pr?.prices ?? pr ?? {};
      const d = dl?.deltas ?? dl ?? {};

      setPrices(p);
      setDeltas(d);
    } catch (e) {
      console.error("[Trading] loadAll error", e);
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 30_000); // refresh 30s
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  const rows = useMemo(() => {
    return symbols.map(sym => {
      const price = prices?.[sym] ?? null;
      const d = deltas?.[sym] ?? {};
      return { sym, price, deltas: d };
    });
  }, [symbols, prices, deltas]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Trading — Prix &amp; Variations</h2>

      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
        <button onClick={loadAll} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
        {err && <span style={{ color:"tomato" }}>⚠ {err}</span>}
      </div>

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={th}>Pair</th>
              <th style={th}>Prix</th>
              {WINDOWS.map(w => (
                <th key={w} style={th}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={2 + WINDOWS.length} style={tdCenter}>Aucune donnée</td></tr>
            )}
            {rows.map(r => (
              <tr key={r.sym}>
                <td style={td}>{r.sym}</td>
                <td style={td}>{formatPrice(r.price)}</td>
                {WINDOWS.map(w => {
                  const v = r.deltas?.[w] ?? null;
                  const color = v == null ? "#bbb" : v >= 0 ? "#22c55e" : "#ef4444";
                  return (
                    <td key={w} style={{...td, color, fontWeight:600}}>
                      {formatPct(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop:12, opacity:0.7 }}>
        Source: <code>/prices</code> &amp; <code>/deltas</code> (agrégées côté API).
      </p>
    </div>
  );
}

const th = { textAlign:"left", borderBottom:"1px solid #333", padding:"8px 10px" };
const td = { borderBottom:"1px solid #222", padding:"8px 10px", whiteSpace:"nowrap" };
const tdCenter = { ...td, textAlign:"center" };