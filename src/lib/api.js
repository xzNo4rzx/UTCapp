/* src/lib/api.js */
import { API_BASE_URL } from "./config.js";

const RAW = (import.meta.env.VITE_API_BASE || API_BASE_URL || "https://utc-api.onrender.com").trim();
const BASE = RAW.replace(/\/+$/,"");

async function jget(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status} ${url}`);
  return r.json();
}

async function jgetSafe(url, fallback) {
  try {
    return await jget(url);
  } catch (e) {
    if (String(e).includes("API 404")) return fallback;
    throw e;
  }
}

export async function apiGetPrices(symbols = []) {
  const q = encodeURIComponent(symbols.join(","));
  return jget(`${BASE}/prices?symbols=${q}`);
}

export async function apiGetDeltas(symbols = [], windows = ["1m","5m","10m","1h","6h","1d","7d"]) {
  const sym = encodeURIComponent(symbols.join(","));
  const win = encodeURIComponent(windows.join(","));
  return jgetSafe(`${BASE}/deltas?symbols=${sym}&windows=${win}`, {});
}

export async function apiGetTopMovers(window = "5m", limit = 5) {
  const w = encodeURIComponent(window);
  const l = encodeURIComponent(limit);
  return jgetSafe(`${BASE}/top-movers?window=${w}&limit=${l}`, { gainers: [], losers: [] });
}