// src/lib/api.js
const RAW_A = import.meta.env.VITE_API_BASE;
const RAW_B = import.meta.env.VITE_API_BASE_URL;
const BASE = (RAW_A || RAW_B || "https://utc-api.onrender.com").replace(/\/+$/,"");

async function jget(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status} ${url}`);
  return r.json();
}

// Essaie une liste d'URLs; logue succès/échec et retourne la première qui répond.
async function jgetFirst(urls, fallback = null) {
  let lastErr = null;
  for (const u of urls) {
    try {
      const data = await jget(u);
      console.info("[api] OK:", u);
      return data;
    } catch (e) {
      console.warn("[api] FAIL:", u, String(e));
      lastErr = e;
    }
  }
  if (fallback !== null) return fallback;
  throw lastErr || new Error("All endpoints failed");
}

// ---------- PUBLIC ----------
export async function apiGetPrices(symbols = []) {
  const q = encodeURIComponent(symbols.join(","));
  return jgetFirst([
    `${BASE}/api/prices?symbols=${q}`,
    `${BASE}/prices?symbols=${q}`,
  ], {});
}

export async function apiGetDeltas(symbols = [], windows = ["1m","5m","10m","1h","6h","1d","7d"]) {
  const sym = encodeURIComponent(symbols.join(","));
  const win = encodeURIComponent(windows.join(","));
  return jgetFirst([
    `${BASE}/api/deltas?symbols=${sym}&windows=${win}`,
    `${BASE}/deltas?symbols=${sym}&windows=${win}`,
  ], {});
}

export async function apiGetTopMovers(window = "5m", limit = 5) {
  const w = encodeURIComponent(window);
  const l = encodeURIComponent(limit);
  return jgetFirst([
    `${BASE}/api/top-movers?window=${w}&limit=${l}`,
    `${BASE}/top-movers?window=${w}&limit=${l}`,
  ], { gainers: [], losers: [] });
}
