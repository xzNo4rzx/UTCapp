// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiGetPrices, apiDeltas } from "../utils/api";

// Symboles à afficher (mets ceux que tu veux)
const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];

const WINDOWS = "1m,5m,10m,1h,6h,1d,7d";

function normalizePrices(resp) {
  // /prices -> { prices: {SYM: number} } ou parfois resp direct (fallback)
  if (resp && typeof resp === "object") {
    if (resp.prices && typeof resp.prices === "object") return resp.prices;
    // fallback: si jamais l’API renvoyait déjà un objet clé->prix
    return resp;
  }
  return {};
}

function normalizeDeltas(resp) {
  // /deltas -> { deltas: {SYM: {1m:..}} }
  if (resp && typeof resp === "object") {
    if (resp.deltas && typeof resp.deltas === "object") return resp.deltas;
    return resp;
  }
  return {};
}

export default function Trading() {
  const [symbols] = useState(DEFAULT_SYMBOLS);
  const [rows, setRows] = useState([]);           // toujours un ARRAY
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      // 1) Appels API
      const [prResp, dlResp] = await Promise.all([
        apiGetPrices(symbols),
        apiDeltas(symbols, WINDOWS),
      ]);

  const [prResp, dlResp] = await Promise.all([
  apiGetPrices(symbols),
  apiDeltas(symbols, WINDOWS),
]);

console.log("DEBUG raw prResp =", prResp);
console.log("DEBUG raw dlResp =", dlResp);

      // 2) Normalisation
      const prices = normalizePrices(prResp);
      const deltas = normalizeDeltas(dlResp);

      // 3) Construction de la liste (toujours un tableau)
      const newRows = symbols.map((s) => {
        const p = prices?.[s] ?? null;
        const d = deltas?.[s] ?? {};
        return {
          symbol: s,
          price: typeof p === "number" ? p : null,
          d1m: d?.["1m"] ?? null,
          d5m: d?.["5m"] ?? null,
          d10m: d?.["10m"] ?? null,
          d1h: d?.["1h"] ?? null,
          d6h: d?.["6h"] ?? null,
          d1d: d?.["1d"] ?? null,
          d7d: d?.["7d"] ?? null,
        };
      });

      setRows(newRows);
    } catch (e) {
      console.error("[Trading] loadAll error", e);
      setErr(e?.message || String(e));
      setRows([]); // garantie: array
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 30_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-xl font-bold">Trading</h1>
        <button
          onClick={loadAll}
          className="px-3 py-1 rounded bg-blue-600 text-white"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
        {err && <span className="text-amber-400">⚠ {err}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="py-2 pr-4">Symbol</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">1m</th>
              <th className="py-2 pr-4">5m</th>
              <th className="py-2 pr-4">10m</th>
              <th className="py-2 pr-4">1h</th>
              <th className="py-2 pr-4">6h</th>
              <th className="py-2 pr-4">1d</th>
              <th className="py-2 pr-4">7d</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((r) => (
              <tr key={r.symbol} className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-medium">{r.symbol}</td>
                <td className="py-2 pr-4">{r.price ?? "—"}</td>
                <td className="py-2 pr-4">{r.d1m ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d5m ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d10m ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d1h ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d6h ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d1d ?? "—"}%</td>
                <td className="py-2 pr-4">{r.d7d ?? "—"}%</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td className="py-3 text-zinc-400" colSpan={9}>
                  Aucune donnée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}