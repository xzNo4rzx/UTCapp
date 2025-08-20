// FICHIER: src/utils/api.js

// Base API résolue (ordre de priorité : fenêtre -> .env -> proxy /api du front)
export const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  import.meta.env.VITE_API_BASE ||
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "/api");

// --- Utils -------------------------------------------------------------------
const toQuery = (params = {}) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

async function httpGet(path, params) {
  const url = `${API_BASE}/${path}${params ? `?${toQuery(params)}` : ""}`;
  const res = await fetch(url, { credentials: "include" });

  // Protection contre les réponses HTML (ex: 404/500 proxy) -> évite "Unexpected token '<'"
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(`API non‑JSON (${res.status}) ${url}: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API ${res.status} ${url}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

// --- PRIX & CANDLES ----------------------------------------------------------
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase().trim();
  if (!sym) return { symbol: sym, price: null };
  const data = await httpGet(`price/${sym}`);
  return { symbol: sym, price: data?.price ?? null };
}

export async function apiGetPrices(symbolsArr = []) {
  const symbols = (symbolsArr || [])
    .map((s) => String(s || "").toUpperCase().trim())
    .filter(Boolean)
    .join(",");
  if (!symbols) return { prices: {}, updatedAt: new Date().toISOString() };
  const data = await httpGet("prices", { symbols });
  return {
    prices: data?.prices || {},
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
}

export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const sym = String(symbol || "").toUpperCase().trim();
  if (!sym) return { symbol: sym, interval, limit, klines: [] };
  const data = await httpGet("klines", { symbol: sym, interval, limit });
  return {
    symbol: sym,
    interval: data?.interval || interval,
    limit: data?.limit || limit,
    klines: data?.klines || [],
  };
}

// --- DELTAS & TOP MOVERS -----------------------------------------------------
export async function apiDeltas(symbolsArr = [], windows = ["1m", "5m", "10m", "1h", "6h", "1d", "7d"]) {
  const symbols = (symbolsArr || [])
    .map((s) => String(s || "").toUpperCase().trim())
    .filter(Boolean)
    .join(",");
  const ws = (windows || []).map(String).join(",");
  if (!symbols) {
    return { deltas: {}, bases: {}, updatedAt: new Date().toISOString() };
  }
  const data = await httpGet("deltas", { symbols, windows: ws });
  return {
    deltas: data?.deltas || {},
    bases: data?.bases || {},
    updatedAt: data?.updatedAt || new Date().toISOString(),
  };
}

export async function apiTopMovers(window = "5m", limit = 5) {
  const data = await httpGet("top-movers", { window, limit });
  return {
    window: data?.window || window,
    updatedAt: data?.updatedAt || new Date().toISOString(),
    gainers: data?.gainers || [],
    losers: data?.losers || [],
  };
}

// --- SIGNALS (compat IATraderContext) ---------------------------------------
export async function apiTickSignals(limit = 100) {
  // côté front : simple fetch périodique (le “tick” est géré par setInterval dans le contexte)
  const data = await httpGet("get-latest-signals", { limit });
  return Array.isArray(data) ? data : [];
}

export async function apiLatestSignals(limit = 100) {
  const data = await httpGet("get-latest-signals", { limit });
  return Array.isArray(data) ? data : [];
}