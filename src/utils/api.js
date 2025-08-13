// src/utils/api.js
// ===============================================================
// API helpers avec auto-fallback /api si HTML reçu (index.html)
// ===============================================================

const ENV_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  "https://utc-api.onrender.com";

function trimSlash(x) { return String(x || "").replace(/\/+$/,""); }
const BASE_CANDIDATES = [ trimSlash(ENV_BASE), trimSlash(ENV_BASE) + "/api" ];

// Active en console si besoin:  window.__API_DEBUG__ = true
const DBG = typeof window !== "undefined" ? !!window.__API_DEBUG__ : true;

function buildURL(base, path, params) {
  const url = new URL(trimSlash(base) + (path.startsWith("/") ? path : `/${path}`));
  if (params && typeof params === "object") {
    for (const [k,v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
    }
  }
  return url.toString();
}

async function tryJson(url, init) {
  const res = await fetch(url, init);
  const txt = await res.text();
  try {
    const data = JSON.parse(txt);
    if (DBG) console.log("[api] OK", res.status, url);
    return { ok:true, data };
  } catch {
    const snip = txt.slice(0,200);
    const isHTML = /^\s*<!doctype html>|^\s*<html/i.test(snip);
    if (DBG) console.error(`[api] NON-JSON (${res.status}) ${url}\n---\n${snip}\n---`);
    return { ok:false, status: res.status, html:isHTML, snippet: snip };
  }
}

async function jsonFetch(path, { method="GET", body, params, headers } = {}) {
  const init = {
    method,
    headers: {
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  // 1/ essai sur base 1, 2/ si HTML => essai sur base 2
  let lastErr = null;
  for (let i=0;i<BASE_CANDIDATES.length;i++) {
    const base = BASE_CANDIDATES[i];
    const url = buildURL(base, path, params);
    if (DBG) console.log("[api] >>>", init.method, url, body ? { body } : "");
    const r = await tryJson(url, init);
    if (r.ok) return r.data;

    lastErr = new Error(`API ${r.status || "?"} ${url}: ${r.html ? "HTML reçu" : "Réponse non JSON"}`);
    // si ce n’est pas de l’HTML, pas la peine d’essayer l’autre base
    if (!r.html) break;

    // sinon on boucle et on tente la base suivante (/api)
    if (DBG) console.warn("[api] fallback -> tente autre BASE");
  }
  throw lastErr || new Error("API: échec inconnu");
}

// ---------------- Endpoints ----------------

export const API_BASE = BASE_CANDIDATES[0];

export async function apiPing() {
  return jsonFetch("/ping");
}

export async function apiMeInit() {
  return jsonFetch("/me/init");
}

export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  return jsonFetch(`/price/${encodeURIComponent(sym)}`);
}

export async function apiGetPrices(symbols) {
  const arr = Array.isArray(symbols) ? symbols : String(symbols || "").split(",");
  const syms = arr.map(s => String(s||"").trim().toUpperCase()).filter(Boolean);
  if (!syms.length) return { prices: {} };
  return jsonFetch("/prices", { params: { symbols: syms.join(",") } });
}

export async function apiGetKlines(symbol, interval="1m", limit=120) {
  const sym = String(symbol || "").toUpperCase();
  return jsonFetch("/klines", { params: { symbol: sym, interval, limit } });
}

export async function apiGetDeltas(symbols, windows="1m,5m,10m,1h,6h,1d,7d") {
  const arr = Array.isArray(symbols) ? symbols : String(symbols || "").split(",");
  const syms = arr.map(s => String(s||"").trim().toUpperCase()).filter(Boolean);
  return jsonFetch("/deltas", { params: { symbols: syms.join(","), windows } });
}

export async function apiTopMovers(window="5m", limit=5) {
  return jsonFetch("/top-movers", { params: { window, limit } });
}

export async function apiLatestSignals(limit=100) {
  return jsonFetch("/get-latest-signals", { params: { limit } });
}

// Compat ancien import
export async function apiTickSignals(limit=100) {
  return apiLatestSignals(limit);
}

if (DBG) {
  console.log("__API_BASE_CANDIDATES__", BASE_CANDIDATES);
}