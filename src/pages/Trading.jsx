// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Les paires qu'on veut afficher (clés deltas)
const WATCHED_PAIRS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT",
];

const WINDOWS = ["1m", "5m", "10m", "1h", "6h", "1d", "7d"];

// helpers
const stripUSDT = (s) => (s || "").toUpperCase().replace(/USDT$/, "");
const fmt = (v, d = 2) =>
  typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "—";

export default function Trading() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      // On demande les prix et les deltas pour les mêmes paires (côté API, les prix reviennent souvent par "base" seulement)
      const [prMap, dlResp] = await Promise.all([
        apiGetPrices(WATCHED_PAIRS),         // -> { BTC: 64000, ETH: 3100, ... } (souvent sans USDT)
        apiDeltas(WATCHED_PAIRS, WINDOWS),   // -> { deltas: { BTCUSDT: {1m:..,5m:..}, ... } }
      ]);

      // Normaliser les PRIX par base symbol (BTC, ETH, …)
      const pricesByBase = {};
      Object.keys(prMap || {}).forEach((k) => {
        const base = stripUSDT(k);
        const v = Number(prMap[k]);
        if (Number.isFinite(v)) pricesByBase[base] = v;
      });

      const deltasByPair = (dlResp && dlResp.deltas) || {};

      // Construire les lignes par PAIRE (clé deltas), en lisant le prix par BASE
      const built = WATCHED_PAIRS.map((pair) => {
        const base = stripUSDT(pair);
        const price = pricesByBase[base];
        const d = deltasByPair[pair] || {};
        return {
          pair,
          base,
          price,
          d1m: d["1m"] ?? null,
          d5m: d["5m"] ?? null,
          d1h: d["1h"] ?? null,
          d1d: d["1d"] ?? null,
        };
      });

      // Petit debug utile
      console.debug("[Trading] Debug:", {
        pairs: WATCHED_PAIRS,
        pricesKeys: Object.keys(prMap || {}),
        deltasKeys: Object.keys(deltasByPair || {}),
      });

      setRows(built);
    } catch (e) {
      console.error("[Trading] loadAll error", e);
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // Auto-refresh toutes les 30s
    const id = setInterval(loadAll, 30_000);
    return () => clearInterval(id);
  }, []);

  const content = useMemo(() => {
    if (loading) return <div style={{ padding: 12 }}>Chargement…</div>;
    if (err) return <div style={{ padding: 12, color: "crimson" }}>Erreur: {err}</div>;

    return (
      <div style={{ padding: 12 }}>
        <h2>Trading — Prix & Deltas</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Pair</th>
              <th style={th}>Base</th>
              <th style={th}>Prix</th>
              <th style={th}>Δ 1m</th>
              <th style={th}>Δ 5m</th>
              <th style={th}>Δ 1h</th>
              <th style={th}>Δ 1d</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.pair}>
                <td style={td}>{r.pair}</td>
                <td style={td}>{r.base}</td>
                <td style={td}>{fmt(r.price, 6)}</td>
                <td style={td}>{fmt(r.d1m, 2)}%</td>
                <td style={td}>{fmt(r.d5m, 2)}%</td>
                <td style={td}>{fmt(r.d1h, 2)}%</td>
                <td style={td}>{fmt(r.d1d, 2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [rows, loading, err]);

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
};