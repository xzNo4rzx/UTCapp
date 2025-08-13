// === Base URL (prod par défaut, override via Vite) ========================
export const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "https://utc-api.onrender.com";

// === Helper GET JSON ======================================================
export async function getJSON(path, opts = {}) {
  const url = /^https?:\/\//.test(path)
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = { "content-type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  const raw = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} :: ${raw.slice(0,200)}`);
  }
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new Error(`Non-JSON response from ${url} :: CT=${ct} :: Preview=${raw.slice(0,200)}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON from ${url} :: ${e?.message} :: Preview=${raw.slice(0,200)}`);
  }
}

// === Endpoints appli ======================================================

// Prix spot pour un seul symbole
export async function apiGetPrice(symbol) {
  const data = await getJSON(`/price?symbol=${symbol}`);
  return data?.price;
}

// Prix spot actuels pour plusieurs symboles
export async function apiGetPrices(symbols) {
  const list = Array.isArray(symbols) ? symbols : [symbols];
  const qs = new URLSearchParams({ symbols: list.join(",") }).toString();
  return getJSON(`/prices?${qs}`);
}

// Bougies (klines)
export async function apiGetKlines(symbol, interval = "1m", limit = 500) {
  const qs = new URLSearchParams({ symbol, interval, limit }).toString();
  return getJSON(`/klines?${qs}`);
}

// Derniers signaux
export async function apiLatestSignals() {
  return getJSON(`/signals/latest`);
}

// Tick des signaux
export async function apiTickSignals() {
  return getJSON(`/signals/tick`);
}
