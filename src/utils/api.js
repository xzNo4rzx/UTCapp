// src/utils/api.js — propre et robuste

// Base URL (priorité env, sinon '/api', sinon fallback Render)
export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "/api";

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };
  if (body !== undefined && body !== null) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (e) {
    throw new Error(`API fetch failed: ${e?.message || e}`);
  }

  // accepte JSON seulement; en cas d'HTML (<!doctype...), on lève une erreur claire
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json") || ct.includes("+json");

  if (!res.ok) {
    // tente de lire json d'erreur sinon texte brut
    if (isJson) {
      let j;
      try { j = await res.json(); } catch {}
      throw new Error(`HTTP ${res.status} ${res.statusText}${j ? `: ${JSON.stringify(j)}` : ""}`);
    } else {
      const t = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}${t ? ` | body: ${t.slice(0,200)}` : ""}`);
    }
  }

  if (isJson) {
    try { return await res.json(); }
    catch (e) { throw new Error(`Invalid JSON from ${url}: ${e?.message || e}`); }
  } else {
    // si l’API renvoie autre chose que JSON, on renvoie brut (cas rare)
    return await res.text();
  }
}

/** Healthcheck */
export async function apiHealth() {
  return request("/health");
}

/** Prix spot unique */
export async function apiGetPrice(symbol) {
  if (!symbol) throw new Error("symbol requis");
  const q = new URLSearchParams({ symbol: String(symbol).toUpperCase() });
  return request(`/price?${q.toString()}`);
}

/** Prix spot multiples */
export async function apiGetPrices(symbols = []) {
  const list = Array.isArray(symbols) ? symbols : [symbols];
  if (!list.length) return { prices: {} };
  const q = new URLSearchParams();
  for (const s of list) q.append("symbol", String(s).toUpperCase());
  return request(`/prices?${q.toString()}`);
}

/** Chandelles/Klines */
export async function apiGetKlines(symbol, interval = "1m", limit = 100) {
  if (!symbol) throw new Error("symbol requis");
  const q = new URLSearchParams({
    symbol: String(symbol).toUpperCase(),
    interval,
    limit: String(limit),
  });
  return request(`/candles?${q.toString()}`);
}

/** Derniers signaux */
export async function apiLatestSignals() {
  return request("/signals/latest");
}

/** Tick des signaux (rafraîchissement) */
export async function apiTickSignals() {
  return request("/signals/tick");
}

export default {
  API_BASE,
  apiHealth,
  apiGetPrice,
  apiGetPrices,
  apiGetKlines,
  apiLatestSignals,
  apiTickSignals,
};
