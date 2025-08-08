// FICHIER: ~/Documents/utc-app-full/src/utils/api.js

// ==== [BLOC: CONFIG] =======================================================
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000";

// ==== [BLOC: HELPERS] ======================================================
const j = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
  }
  return res.json();
};

// ==== [BLOC: CLIENT] =======================================================
export async function apiGetPrice(symbol /* ex: 'BTC' */) {
  const s = String(symbol || "").toUpperCase();
  return j(await fetch(`${API_BASE}/price/${encodeURIComponent(s)}`));
}

export async function apiGetPrices(symbols /* ex: ['BTC','ETH'] */) {
  const list = (symbols || []).map((s) => String(s).toUpperCase()).join(",");
  return j(await fetch(`${API_BASE}/prices?symbols=${encodeURIComponent(list)}`));
}

export async function apiGetKlines(pair /* ex: 'BTC/USDT' */, interval = "1m", limit = 120) {
  const p = String(pair || "BTC/USDT").toUpperCase();
  const url = `${API_BASE}/klines?symbol=${encodeURIComponent(p)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(limit)}`;
  return j(await fetch(url));
}

export async function apiTickSignals() {
  return j(await fetch(`${API_BASE}/utcapp/signals`));
}

export async function apiLatestSignals(limit = 100) {
  return j(await fetch(`${API_BASE}/get-latest-signals?limit=${encodeURIComponent(limit)}`));
}

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Nouveau client front → appelle TON backend (évite CORS Binance).
// - Endpoints: /price/{symbol}, /prices, /klines, /utcapp/signals, /get-latest-signals.
// - API_BASE = VITE_API_BASE (déjà configuré).