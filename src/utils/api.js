// FICHIER: src/utils/api.js
// Base API :
// - 1) VITE_API_BASE si défini (ex: https://utc-api.onrender.com)
// - 2) window.__API_BASE__ si tu joues côté client
// - 3) /api (proxy/render)
export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "/api";

// --- petit helper GET JSON robuste
async function httpGetJson(path, params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  const url = `${API_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}${
    usp.toString() ? `?${usp.toString()}` : ""
  }`;

  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${url}: ${text}`);
  }

  // pro­tection "Unexpected token <" => on checke le Content‑Type
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`API content-type not JSON for ${url}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// =================== PRICES / KLINES ===================

export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  const data = await httpGetJson(`price/${encodeURIComponent(sym)}`);
  return Number(data?.price ?? NaN);
}

export async function apiGetPrices(symbolsArr) {
  const symbols = (symbolsArr || [])
    .map((s) => String(s || "").toUpperCase().trim())
    .filter(Boolean);
  if (!symbols.length) return {};
  const data = await httpGetJson("prices", { symbols: symbols.join(",") });
  const out = {};
  const mp = data?.prices || {};
  for (const k of Object.keys(mp)) {
    const v = Number(mp[k]);
    if (Number.isFinite(v)) out[k.toUpperCase()] = v;
  }
  return out;
}

export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const data = await httpGetJson("klines", { symbol, interval, limit });
  return Array.isArray(data?.klines) ? data.klines : [];
}

// =================== DELTAS & TOP MOVERS ===================

export async function apiDeltas(symbolsArr, windows = ["1m", "5m", "10m", "1h", "6h", "1d", "7d"]) {
  const symbols = (symbolsArr || [])
    .map((s) => String(s || "").toUpperCase().trim())
    .filter(Boolean)
    .join(",");
  const ws = (windows || []).join(",");
  if (!symbols) {
    return { deltas: {}, bases: {}, updatedAt: new Date().toISOString() };
  }
  const data = await httpGetJson("deltas", { symbols, windows: ws });
  return {
    deltas: data?.deltas || {},
    bases: data?.bases || {},
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
}

export async function apiTopMovers(window = "5m", limit = 5) {
  const data = await httpGetJson("top-movers", { window, limit });
  return {
    window: data?.window || window,
    updatedAt: data?.updatedAt || new Date().toISOString(),
    gainers: data?.gainers || [],
    losers: data?.losers || [],
  };
}

// =================== SIGNALS ===================

export async function apiLatestSignals(limit = 100) {
  const data = await httpGetJson("get-latest-signals", { limit });
  return Array.isArray(data) ? data : [];
}

// Tick : si tu as un endpoint de “poll”, sinon no-op
export async function apiTickSignals() {
  try {
    await httpGetJson("trader-log");
  } catch (_) {}
}