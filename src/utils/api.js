// FICHIER: ~/Documents/utc-app-full/src/utils/api.js

// ==== [CONFIG] ==============================================================
const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/+$/, "");

// ==== [HELPERS] =============================================================
const toJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text.slice(0, 180)}`);
  }
  if (!ct.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Réponse non-JSON depuis ${res.url}: ${text.slice(0, 180)}`);
  }
  return res.json();
};

// ==== [CLIENT — PRIX & KLINES] ==============================================
export async function apiGetPrice(symbol) {
  const s = String(symbol || "").toUpperCase();
  return toJson(await fetch(`${API_BASE}/price/${encodeURIComponent(s)}`));
}
export async function apiGetPrices(symbols = []) {
  const list = symbols.map((s) => String(s).toUpperCase()).join(",");
  return toJson(await fetch(`${API_BASE}/prices?symbols=${encodeURIComponent(list)}`));
}
export async function apiGetKlines(pair = "BTC/USDT", interval = "1m", limit = 120) {
  const p = String(pair || "BTC/USDT").toUpperCase();
  const url = `${API_BASE}/klines?symbol=${encodeURIComponent(p)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)}`;
  return toJson(await fetch(url));
}

// ==== [CLIENT — SIGNAUX & LOGS] =============================================
export async function apiTickSignals() {
  return toJson(await fetch(`${API_BASE}/utcapp/signals`));
}
export async function apiLatestSignals(limit = 100) {
  return toJson(await fetch(`${API_BASE}/get-latest-signals?limit=${encodeURIComponent(limit)}`));
}
export async function apiGetTraderLog() {
  return toJson(await fetch(`${API_BASE}/trader-log`));
}

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Ajout apiGetTraderLog() -> /trader-log
// - Remplacement /get-latest-signals par /get-latest-signals via apiLatestSignals()
// - Tout passe par VITE_API_BASE (https://utc-api.onrender.com)