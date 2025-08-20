// FICHIER: src/pages/Trading.jsx (version diagnostic)
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas, API_BASE } from "../utils/api";

// Ajuste si ton backend renvoie BTC/ETH/SOL sans USDT
const DEFAULT_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];
const WINDOWS = ["1m", "5m", "1h"];

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
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(6);
}
function normCandidates(sym) {
  // On tente plusieurs normalisations : exact, sans "/", sans "USDT", avec "USDT"
  const s = String(sym || "").toUpperCase();
  const out = [s];
  if (s.includes("/")) out.push(s.replace("/", ""));
  if (s.endsWith("USDT")) out.push(s.slice(0, -4)); // BTCUSDT -> BTC
  else out.push(s + "USDT");                         // BTC -> BTCUSDT
  return Array.from(new Set(out));
}

export default function Trading() {
  const [pairs, setPairs] = useState(DEFAULT_PAIRS);
  const [prices, setPrices] = useState({});
  const [deltas, setDeltas] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [diag, setDiag] = useState({
    fetchedAt: "",
    pricesKeys: [],
    deltasKeys: [],
    lastPricesSample: "",
    lastDeltasSample: "",
  });

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const [pr, dl] = await Promise.all([apiGetPrices(pairs), apiDeltas(pairs, WINDOWS)]);
      // Logs console pour voir brut
      console.log("[Trading] apiGetPrices ->", pr);
      console.log("[Trading] apiDeltas ->", dl);

      const deltasMap = (dl && dl.deltas) || {};
      setPrices(pr || {});
      setDeltas(deltasMap);

      const pk = Object.keys(pr || {});
      const dk = Object.keys(deltasMap || {});
      setDiag({
        fetchedAt: new Date().toISOString(),
        pricesKeys: pk,
        deltasKeys: dk,
        lastPricesSample: JSON.stringify(pr || {}, null, 2).slice(0, 600),
        lastDeltasSample: JSON.stringify(deltasMap || {}, null, 2).slice(0, 600),
      });
    } catch (e) {
      console.error(e);
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
      const candidates = normCandidates(sym);
      let p = null;
      for (const c of candidates) if (prices[c] !== undefined) { p = prices[c]; break; }

      let d = null;
      for (const c of candidates) if (deltas[c] !== undefined) { d = deltas[c]; break; }

      return { sym, price: p, d: d || {} };
    });
  }, [pairs, prices, deltas]);

  // Qui manque ?
  const missingInPrices = pairs.filter(
    (sym) => !normCandidates(sym).some((c) => prices[c] !== undefined)
  );
  const missingInDeltas = pairs.filter(
    (sym) => !normCandidates(sym).some((c) => deltas[c] !== undefined)
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Trading (diagnostic)</h2>

      {/* Panneau debug clair */}
      <div style={box}>
        <div><b>API_BASE</b>: <code>{API_BASE}</code></div>
        <div><b>Fetched at</b>: {diag.fetchedAt || "—"}</div>
        <div style={{ marginTop: 8 }}>
          <b>Clés reçues</b> — prices: [{diag.pricesKeys.join(", ")}] | deltas: [{diag.deltasKeys.join(", ")}]
        </div>
        {(missingInPrices.length || missingInDeltas.length) ? (
          <div style={{ marginTop: 8, color: "#b35" }}>
            Manquants ➜ prices: [{missingInPrices.join(", ")}] | deltas: [{missingInDeltas.join(", ")}]
          </div>
        ) : null}
        <div style={{ marginTop: 8 }}>
          <button onClick={load}>↻ Refresh</button>
        </div>
        {/* Échantillons tronqués pour inspection rapide */}
        <details style={{ marginTop: 8 }}>
          <summary>Voir échantillons JSON</summary>
          <pre style={pre}>{diag.lastPricesSample}</pre>
          <pre style={pre}>{diag.lastDeltasSample}</pre>
        </details>
        {err ? <div style={{ marginTop: 8, color: "red" }}>{err}</div> : null}
      </div>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
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
        Si rien ne s’affiche, regarde les “Clés reçues”. Si elles sont vides, c’est le backend.
        Si elles existent mais ne correspondent pas aux paires, ajuste <code>DEFAULT_PAIRS</code> (ex: BTC/ETH/SOL).
      </p>
    </div>
  );
}

const box = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 12,
  background: "#fafafa",
};
const pre = {
  margin: 0,
  padding: 8,
  background: "#111",
  color: "#ddd",
  borderRadius: 6,
  overflowX: "auto",
  maxHeight: 280,
};
const th = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px 10px",
};
const td = {
  borderBottom: "1px solid #eee",
  padding: "8px 10px",
};