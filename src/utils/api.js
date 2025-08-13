// src/utils/api.js
/* =========================================================================================
 * API helpers (avec debug agressif pour traquer le "Unexpected token '<' ... not valid JSON")
 * ========================================================================================= */

export const API_BASE = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  "https://utc-api.onrender.com"
).replace(/\/+$/, ""); // sans trailing slash

// Active le debug si besoin dans la console du navigateur : window.__API_DEBUG__ = true
const DBG = typeof window !== "undefined" ? !!window.__API_DEBUG__ : true;

// Petit helper pour construire les URLs avec query params
function buildURL(path, params) {
  const url = new URL(API_BASE + (path.startsWith("/") ? path : `/${path}`));
  if (params && typeof params === "object") {
    Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .forEach(([k, v]) => url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v)));
  }
  return url.toString();
}

// Fetch qui log + tente JSON + détecte les réponses HTML (index.html / 404 etc.)
async function jsonFetch(path, { method = "GET", body = undefined, params = undefined, headers = {} } = {}) {
  const url = buildURL(path, params);

  if (DBG) {
    console.log("[api] >>>", method, url, body ? { body } : "");
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (DBG) {
    console.log("[api] <<<", res.status, res.statusText, "from", url);
  }

  // Si ce n'est pas du JSON valide, on dump un extrait pour comprendre (souvent un HTML 404/500)
  try {
    const data = JSON.parse(text);
    return data;
  } catch {
    const snippet = text.slice(0, 200);
    const looksLikeHTML = /^\s*<!doctype html>|^\s*<html/i.test(snippet);
    if (looksLikeHTML) {
      console.error(
        `[api] Réponse HTML au lieu de JSON pour ${url} (status ${res.status}). Extrait:\n---\n${snippet}\n---`
      );
      throw new Error(`API ${res.status} ${url}: HTML reçu (probable mauvaise route ou base URL).`);
    } else {
      console.error(
        `[api] Réponse non-JSON pour ${url} (status ${res.status}). Extrait:\n---\n${snippet}\n---`
      );
      throw new Error(`API ${res.status} ${url}: Réponse non JSON.`);
    }
  }
}

/* =========================================================================================
 * Endpoints wrappers
 * ========================================================================================= */

// /ping
export async function apiPing() {
  return jsonFetch("/ping");
}

// /me/init
export async function apiMeInit() {
  return jsonFetch("/me/init");
}

// /price/{symbol}
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  return jsonFetch(`/price/${encodeURIComponent(sym)}`);
}

// /prices?symbols=BTC,ETH
export async function apiGetPrices(symbols) {
  const list = Array.isArray(symbols) ? symbols : String(symbols || "").split(",");
  const syms = list.map(s => String(s || "").trim().toUpperCase()).filter(Boolean);
  if (!syms.length) return { prices: {} };
  return jsonFetch("/prices", { params: { symbols: syms.join(",") } });
}

// /klines?symbol=BTCUSDT&interval=1m&limit=120
export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const sym = String(symbol || "").toUpperCase();
  return jsonFetch("/klines", { params: { symbol: sym, interval, limit } });
}

// /deltas?symbols=BTC,ETH&windows=1m,5m,10m,1h,6h,1d,7d
export async function apiGetDeltas(symbols, windows = "1m,5m,10m,1h,6h,1d,7d") {
  const list = Array.isArray(symbols) ? symbols : String(symbols || "").split(",");
  const syms = list.map(s => String(s || "").trim().toUpperCase()).filter(Boolean);
  return jsonFetch("/deltas", { params: { symbols: syms.join(","), windows } });
}

// /top-movers?window=5m&limit=5
export async function apiTopMovers(window = "5m", limit = 5) {
  return jsonFetch("/top-movers", { params: { window, limit } });
}

// /get-latest-signals?limit=100
export async function apiLatestSignals(limit = 100) {
  return jsonFetch("/get-latest-signals", { params: { limit } });
}

/* -----------------------------------------------------------------------------------------
 * Stub optionnel pour compat compat (si un ancien code importe apiTickSignals,
 * on le fait pointer vers apiLatestSignals pour éviter un crash de build/runtime).
 * ----------------------------------------------------------------------------------------- */
export async function apiTickSignals(limit = 100) {
  return apiLatestSignals(limit);
}

/* =========================================================================================
 * Petit log au chargement pour vérifier la base
 * ========================================================================================= */
if (DBG) {
  console.log("__API_BASE__", API_BASE);
}