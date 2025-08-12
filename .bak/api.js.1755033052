// src/utils/api.js
const rawA = import.meta.env.VITE_API_BASE;
const rawB = import.meta.env.VITE_API_BASE_URL;
export const API_BASE = (rawA || rawB || "https://utc-api.onrender.com").replace(/\/+$/, "");

async function jget(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status} ${url}`);
  return r.json();
}

async function jgetSafe(url, fallback) {
  try {
    return await jget(url);
  } catch (e) {
    if (String(e).includes("API 404 ")) return fallback;
    throw e;
  }
}

export async function apiGetPrices(symbols = []) {
  const q = encodeURIComponent(symbols.join(","));
  return jget(`${API_BASE}/prices?symbols=${q}`);
}

export async function apiGetPrice(symbol = "") {
  const s = encodeURIComponent(String(symbol).toUpperCase());
  return jget(`${API_BASE}/price/${s}`);
}

export async function apiGetDeltas(symbols = [], windows = ["1m","5m","10m","1h","6h","1d","7d"]) {
  const sym = encodeURIComponent(symbols.join(","));
  const win = encodeURIComponent(windows.join(","));
  return jgetSafe(`${API_BASE}/deltas?symbols=${sym}&windows=${win}`, {});
}

export async function apiGetTopMovers(window = "5m", limit = 5) {
  const w = encodeURIComponent(window);
  const l = encodeURIComponent(limit);
  return jgetSafe(`${API_BASE}/top-movers?window=${w}&limit=${l}`, { gainers: [], losers: [] });
}

export async function apiGetKlines(symbol = "", interval = "1m", limit = 200) {
  const s = encodeURIComponent(String(symbol).toUpperCase());
  const i = encodeURIComponent(interval);
  const l = encodeURIComponent(limit);
  return jget(`${API_BASE}/klines?symbol=${s}&interval=${i}&limit=${l}`);
}

export async function apiTickSignals() {
  return jgetSafe(`${API_BASE}/tick-signals`, { ok: false });
}

export async function apiLatestSignals() {
  return jgetSafe(`${API_BASE}/get-latest-signals`, []);
}

export async function apiGetTraderLog() {
  return jgetSafe(`${API_BASE}/trader-log`, []);
}
