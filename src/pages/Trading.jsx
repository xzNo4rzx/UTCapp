// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Fallback au cas où rien ne remonte encore côté backend
const DEFAULT_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
];

const WINDOWS = ["1m", "5m", "10m", "1h", "6h", "1d", "7d"];

function classForDelta(v) {
  if (typeof v !== "number" || !isFinite(v)) return "text-gray-500";
  if (v > 0) return "text-green-600";
  if (v < 0) return "text-red-600";
  return "text-gray-800";
}

export default function Trading() {
  const [prices, setPrices] = useState({});        // { BTCUSDT: 64000, ... }
  const [deltas, setDeltas] = useState({});        // { BTCUSDT: { "1m": 0.2, ... }, ... }
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Les symboles affichés = union clés(prices) ∪ clés(deltas) ∪ fallback
  const symbols = useMemo(() => {
    const s = new Set(DEFAULT_SYMBOLS);
    Object.keys(prices || {}).forEach((k) => s.add(String(k).toUpperCase()));
    Object.keys(deltas || {}).forEach((k) => s.add(String(k).toUpperCase()));
    return Array.from(s);
  }, [prices, deltas]);

  async function loadAll() {
    setErr(null);
    try {
      // 1) On demande sur la base des symboles connus (fallback si rien)
      const baseSymbols = symbols.length ? symbols : DEFAULT_SYMBOLS;

      const [pricesResp, deltasResp] = await Promise.all([
        apiGetPrices(baseSymbols),
        apiDeltas(baseSymbols, WINDOWS),
      ]);

      // pricesResp attendu objet ; si jamais ce n'est pas un objet, fallback {}
      const prObj = pricesResp && typeof pricesResp === "object" ? pricesResp : {};
      setPrices(prObj);

      // deltasResp attendu { deltas, bases, updatedAt }
      const dlObj =
        deltasResp && typeof deltasResp === "object" && deltasResp.deltas
          ? deltasResp.deltas
          : {};
      setDeltas(dlObj);

      setUpdatedAt(
        (deltasResp && deltasResp.updatedAt) || new Date().toISOString()
      );
    } catch (e) {
      console.error("[Trading] loadAll error", e);
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // premier chargement
    // (on utilise DEFAULT_SYMBOLS au premier run si rien en state)
    loadAll();
    // rafraîchit toutes les 30s
    const id = setInterval(loadAll, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // un seul montage

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Trading — Prix & Deltas
      </h1>

      <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
        {loading ? "Chargement…" : "Données chargées."}{" "}
        {updatedAt ? `— MAJ: ${updatedAt}` : null}{" "}
        {err ? (
          <span style={{ color: "#b91c1c", fontWeight: 600 }}>
            • Erreur: {err}
          </span>
        ) : null}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ padding: "8px 4px" }}>Symbol</th>
            <th style={{ padding: "8px 4px" }}>Price</th>
            <th style={{ padding: "8px 4px" }}>Δ 1m</th>
            <th style={{ padding: "8px 4px" }}>Δ 5m</th>
            <th style={{ padding: "8px 4px" }}>Δ 1h</th>
            <th style={{ padding: "8px 4px" }}>Δ 1d</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => {
            const p = prices?.[sym];
            const d = deltas?.[sym] || {};
            const d1m = d?.["1m"];
            const d5m = d?.["5m"];
            const d1h = d?.["1h"];
            const d1d = d?.["1d"];

            return (
              <tr key={sym} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 4px", fontWeight: 600 }}>{sym}</td>
                <td style={{ padding: "8px 4px" }}>
                  {typeof p === "number" && isFinite(p) ? p : "—"}
                </td>
                <td style={{ padding: "8px 4px" }} className={classForDelta(d1m)}>
                  {typeof d1m === "number" && isFinite(d1m) ? `${d1m}%` : "—"}
                </td>
                <td style={{ padding: "8px 4px" }} className={classForDelta(d5m)}>
                  {typeof d5m === "number" && isFinite(d5m) ? `${d5m}%` : "—"}
                </td>
                <td style={{ padding: "8px 4px" }} className={classForDelta(d1h)}>
                  {typeof d1h === "number" && isFinite(d1h) ? `${d1h}%` : "—"}
                </td>
                <td style={{ padding: "8px 4px" }} className={classForDelta(d1d)}>
                  {typeof d1d === "number" && isFinite(d1d) ? `${d1d}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mini box debug utile en phase intégration */}
      <div
        style={{
          marginTop: 16,
          padding: 8,
          background: "#f9fafb",
          border: "1px dashed #e5e7eb",
          fontSize: 12,
          lineHeight: "18px",
          color: "#374151",
        }}
      >
        <div>
          <strong>Debug:</strong> symbols={JSON.stringify(symbols)}
        </div>
        <div>prices keys={JSON.stringify(Object.keys(prices || {}))}</div>
        <div>deltas keys={JSON.stringify(Object.keys(deltas || {}))}</div>
      </div>
    </div>
  );
}