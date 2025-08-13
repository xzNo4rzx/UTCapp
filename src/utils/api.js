// src/utils/api.js

// --- Base ---
const RAW_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "";

function trimSlashes(s) {
  return String(s || "").replace(/\/+$/,"");
}
const API_BASE = trimSlashes(RAW_BASE);

// --- HTTP JSON helper (détecte HTML/erreurs) ---
async function getJSON(path, options = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${p}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    const snippet = text.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} :: ${snippet}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    const snippet = text.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`Non‑JSON from ${url} :: ${snippet}`);
  }
}

// --- API publiques ---

// Prix spot (un seul)
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  const r = await apiGetPrices([sym]);
  return r?.prices?.[sym] ?? null;
}

// Prix spot (liste) -> { prices: {SYM: number, ...} }
export async function apiGetPrices(symbols) {
  const list = Array.isArray(symbols) ? symbols : [symbols];
  const clean = list.map(s => String(s || "").toUpperCase()).filter(Boolean);
  const qs = new URLSearchParams({ symbols: clean.join(",") }).toString();
  return getJSON(`/prices?${qs}`);
}

// Bougies
export async function apiGetKlines(symbol, interval = "1m", limit = 500) {
  const qs = new URLSearchParams({ symbol, interval, limit }).toString();
  return getJSON(`/klines?${qs}`);
}

// Signaux
export async function apiLatestSignals() {
  return getJSON(`/signals/latest`);
}
export async function apiTickSignals() {
  return getJSON(`/signals/tick`);
}

// Santé (optionnel côté backend)
export async function apiHealth() {
  return getJSON(`/health`);
}

export { API_BASE };

export default {
  API_BASE,
  apiGetPrice,
  apiGetPrices,
  apiGetKlines,
  apiLatestSignals,
  apiTickSignals,
  apiHealth,
};
