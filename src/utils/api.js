// utils/api.js — robuste & aligné PricesProbe

export const API_BASE =
  (typeof window !== "undefined" && (window.__API_BASE__ || window.__API_ORIGIN__)) ||
  import.meta.env.VITE_API_BASE ||
  "/api";

async function httpGet(path, params = {}) {
  const url = new URL(path, API_BASE.endsWith("/") ? API_BASE : API_BASE + "/");
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
  });
  const res = await fetch(url.toString(), { credentials: "omit" });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${url}: ${text || res.statusText}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`API content-type not JSON for ${url}: ${text.slice(0, 120)}`);
  }
  return res.json();
}

export async function apiPing() {
  return httpGet("ping");
}

export async function apiGetPrices(symbolsArr) {
  const symbols = (symbolsArr || [])
    .map(s => String(s || "").toUpperCase().trim())
    .filter(Boolean)
    .join(",");
  if (!symbols) return { prices: {}, updatedAt: new Date().toISOString() };

  // Backend: GET /prices?symbols=BTC,ETH,SOL -> { prices: {...}, updatedAt: ISO }
  const data = await httpGet("prices", { symbols });
  const prices = data?.prices && typeof data.prices === "object" ? data.prices : {};
  return { prices, updatedAt: data?.updatedAt || new Date().toISOString() };
}

export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const data = await httpGet("klines", { symbol, interval, limit });
  return Array.isArray(data?.klines) ? data.klines : [];
}

// Optionnel: deltas/top-movers si tu les utilises plus tard
export async function apiGetDeltas(symbolsArr, windows = ["1m","5m","10m","1h","6h","1d","7d"]) {
  const symbols = (symbolsArr || []).map(s => String(s || "").toUpperCase().trim()).filter(Boolean).join(",");
  const ws = (windows || []).join(",");
  if (!symbols) return { deltas: {}, bases: {}, updatedAt: new Date().toISOString() };
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
// ---- Prix unique ----
export async function apiGetPrice(symbol) {
  if (!symbol) return null;
  const { prices } = await apiGetPrices([symbol]);
  return prices?.[symbol] ?? null;
}

// ---- Tick des signaux IA ----
// Permet de "pinger" le backend pour récupérer l'état courant
export async function apiTickSignals() {
  const data = await httpGet("tick-signals");
  return {
    updatedAt: data?.updatedAt || new Date().toISOString(),
    signals: data?.signals || [],
  };
}