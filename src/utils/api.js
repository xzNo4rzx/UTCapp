// src/utils/api.js
const API_BASE = (import.meta.env.VITE_API_BASE || 'https://utc-api.onrender.com').replace(/\/+$/,'');

/** Fetch helper avec gestion stricte du JSON et messages d'erreur utiles */
async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: 'GET', ...opts });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');

  if (!res.ok) {
    let body;
    try { body = isJSON ? await res.json() : await res.text(); } catch { body = null; }
    const msg = typeof body === 'object' && body !== null ? JSON.stringify(body) : (body || '');
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url} :: ${msg}`);
  }
  return isJSON ? res.json() : res.text();
}

/** /health (si 404 on renvoie un statut neutre pour éviter de casser le front) */
export async function apiHealth() {
  const url = `${API_BASE}/health`;
  const res = await fetch(url);
  const ct = res.headers.get('content-type') || '';
  if (res.status === 404) return { ok: false, missing: true, url };
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}`);
  return ct.includes('application/json') ? res.json() : { raw: await res.text() };
}

/** /prices?symbols=BTCUSDT,ETHUSDT…  → { prices: {BTC:123,...}, deltas:{}, lastPriceUpdatedAt:"..." } */
export async function apiGetPrices(symbols) {
  const arr = Array.isArray(symbols) ? symbols : [symbols];
  const q = new URLSearchParams({ symbols: arr.join(',') });
  return request(`/prices?${q.toString()}`);
}

/** Convenience: un seul prix (string symbole) → number|null */
export async function apiGetPrice(symbol) {
  const data = await apiGetPrices([symbol]);
  // Le backend retourne { prices: { BTC: 123.45 } } → on mappe "BTCUSDT" → "BTC"
  // Heuristique simple: on prend la partie alpha en tête (ex: BTCUSDT -> BTC)
  const key = String(symbol || '').toUpperCase().match(/^[A-Z]+/g)?.[0] || String(symbol || '').toUpperCase();
  const v = Number(data?.prices?.[key]);
  return Number.isFinite(v) ? v : null;
}

/** /klines?symbol=BTCUSDT&interval=1m&limit=500 → [[openTime,open,high,low,close,vol,...], ...] */
export async function apiGetKlines(symbol, interval = '1m', limit = 500) {
  const q = new URLSearchParams({
    symbol: String(symbol || '').toUpperCase(),
    interval: String(interval),
    limit: String(limit),
  });
  return request(`/klines?${q.toString()}`);
}

/** /signals/latest → JSON */
export async function apiLatestSignals() {
  return request(`/signals/latest`);
}

/** /signals/tick → JSON (poll/rafraîchissement) */
export async function apiTickSignals() {
  return request(`/signals/tick`);
}

export const API_BASE_URL = API_BASE;

export default {
  API_BASE: API_BASE_URL,
  apiHealth,
  apiGetPrice,
  apiGetPrices,
  apiGetKlines,
  apiLatestSignals,
  apiTickSignals,
};
