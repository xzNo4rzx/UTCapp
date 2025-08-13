// src/utils/api.js

// ----- Base URL (configurable via .env/.env.production) ---------------------
// VITE_API_BASE=https://utc-api.onrender.com
export const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "https://utc-api.onrender.com";

// Petit helper pour voir la base au runtime (une seule fois)
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("__API_BASE__", API_BASE);
}

// ----- Utils ----------------------------------------------------------------
function buildUrl(path, params) {
  const u = new URL(path.replace(/^\//, ""), API_BASE + "/");
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      u.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
    });
  }
  return u.toString();
}

// fetch JSON robuste : si la réponse n’est pas JSON (ex: HTML 404),
// on remonte une erreur explicite avec l’aperçu du body.
export async function jsonFetch(url, options) {
  const res = await fetch(url, {
    // credentials si besoin plus tard (COOKIES) ; inutile sinon
    // credentials: "include",
    ...(options || {}),
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(`API ${res.status} ${url}: ${text.slice(0, 200)}`);
    }
    return data;
  } catch {
    // Pas du JSON → doctype/HTML probable
    throw new Error(`API ${res.status} ${url}: ${text.slice(0, 200)}`);
  }
}

// ----- Endpoints prix -------------------------------------------------------

// Prix d’un seul symbole (string ou déjà en USDT). Retourne {symbol, price}
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Le backend a /price/{symbol} ET /prices?symbols=...
  // On utilise /price/{symbol} quand on a un seul symbole.
  const url = buildUrl(`/price/${sym}`);
  const data = await jsonFetch(url);
  // compat: certains handlers renvoient {symbol, price}, d'autres {prices:{SYM:...}}
  if (data && typeof data.price === "number") {
    return { symbol: (data.symbol || sym).toUpperCase(), price: data.price };
  }
  if (data && data.prices && typeof data.prices[sym] === "number") {
    return { symbol: sym, price: data.prices[sym] };
  }
  return { symbol: sym, price: null };
}

// Prix multiples : symbols = ["BTC","ETH","SOL", ...]
// Retourne { prices: { BTC: number, ETH: number, ... }, updatedAt }
export async function apiGetPrices(symbols) {
  const list = (symbols || [])
    .map((s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);

  if (!list.length) return { prices: {}, updatedAt: new Date().toISOString() };

  const url = buildUrl("/prices", { symbols: list.join(",") });
  const data = await jsonFetch(url);

  // Le backend renvoie { prices: { BTC: 123, ETH: 456 }, updatedAt: iso }
  // (ou parfois { symbols:[], prices:{} } selon route)
  const out = {};
  if (data && data.prices && typeof data.prices === "object") {
    for (const [k, v] of Object.entries(data.prices)) {
      const K = String(k).toUpperCase();
      const num = Number(v);
      if (Number.isFinite(num)) out[K] = num;
    }
  }
  return { prices: out, updatedAt: data?.updatedAt || new Date().toISOString() };
}

// Chandeliers/Klines (pour les charts)
export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const sym = String(symbol || "").toUpperCase();
  const url = buildUrl("/klines", { symbol: sym, interval, limit });
  const data = await jsonFetch(url);
  // backend shape: { symbol, interval, limit, klines: [...] }
  return Array.isArray(data?.klines) ? data.klines : [];
}

// ----- Signals / Logs -------------------------------------------------------

// Derniers signaux (fichier data/signals.json exposé par l’API)
export async function apiLatestSignals(limit = 100) {
  const url = buildUrl("/get-latest-signals", { limit });
  const data = await jsonFetch(url);
  // backend renvoie un tableau direct ou { ... } → on normalise en array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.signals)) return data.signals;
  return [];
}

// Tick “signals” (wrapper pratique si le front s’attend à cette fonction)
// Ici on retourne simplement le même payload que apiLatestSignals.
export async function apiTickSignals(limit = 50) {
  return apiLatestSignals(limit);
}

// ----- Export helpers optionnels --------------------------------------------
export { buildUrl };