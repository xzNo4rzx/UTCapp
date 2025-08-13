// ===== API client unique (front) =====

export const API_BASE =
  (typeof import.meta !== "undefined" &&
   import.meta.env &&
   import.meta.env.VITE_API_BASE) || "";

// Fabrique une URL absolue en préfixant /api/* avec API_BASE s'il est défini
function makeURL(path) {
  const base =
    API_BASE || (typeof window !== "undefined" ? window.location.origin : "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

// GET JSON strict (refuse l'HTML => l'erreur "<!doctype ..." que tu vois)
async function getJSON(path, opts = {}) {
  const url = makeURL(path);
  const headers = { Accept: "application/json", ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  const raw = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${url} :: ${raw.slice(0,200)}`);
  }
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new Error(`Non-JSON response :: ${url} :: CT=${ct} :: Preview=${raw.slice(0,200)}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON :: ${url} :: ${e?.message} :: Preview=${raw.slice(0,200)}`);
  }
}

// === Endpoints ===
// Prix spot d'un symbole
export async function apiGetPrice(symbol) {
  const qs = new URLSearchParams({ symbol }).toString();
  return getJSON(`/api/price?${qs}`);
}

// Prix spot de plusieurs symboles  => { prices: { BTCUSDT: 123.45, ... } }
export async function apiGetPrices(symbols) {
  const list = Array.isArray(symbols) ? symbols : [symbols];
  const qs = new URLSearchParams({ symbols: list.join(",") }).toString();
  return getJSON(`/api/prices?${qs}`);
}

// Bougies
export async function apiGetKlines(symbol, interval = "1m", limit = 500) {
  const qs = new URLSearchParams({ symbol, interval, limit }).toString();
  return getJSON(`/api/klines?${qs}`);
}

// Signaux
export async function apiLatestSignals() {
  return getJSON(`/api/signals/latest`);
}
export async function apiTickSignals() {
  return getJSON(`/api/signals/tick`);
}

// Optionnel : santé API (si présent côté backend)
export async function apiHealth() {
  return getJSON(`/api/health`);
}

export default {
  API_BASE,
  apiGetPrice,
  apiGetPrices,
  apiGetKlines,
  apiLatestSignals,
  apiTickSignals,
  apiHealth,
};
