// utils/api.js

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "";

async function getJSON(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  try { return JSON.parse(text); } catch { return {}; }
}

/**
 * Retourne les prix courants pour une liste de symboles.
 * Response attendue: { prices: { SYM: number, ... } }
 */
export async function apiGetPrices(symbols = []) {
  const body = JSON.stringify({ symbols: Array.from(new Set(symbols)).map(s => String(s||"").toUpperCase()).filter(Boolean) });
  return await getJSON("/api/prices", { method: "POST", body });
}

/**
 * Retourne des bougies (klines) pour un symbole.
 * Response attendue: { candles: [...] }
 */
export async function apiGetKlines(symbol, interval = "1m", limit = 100) {
  const params = new URLSearchParams({
    symbol: String(symbol||"").toUpperCase(),
    interval: String(interval||"1m"),
    limit: String(limit||"100"),
  });
  return await getJSON(`/api/klines?${params.toString()}`);
}

/**
 * Déclenche un tick de génération de signaux côté serveur.
 * Response libre / ignorée par le client.
 */
export async function apiTickSignals() {
  return await getJSON("/api/signals/tick", { method: "POST", body: "{}" });
}

/**
 * Récupère les derniers signaux.
 * Response attendue: { signals: [...] }
 */
export async function apiLatestSignals() {
  return await getJSON("/api/signals/latest");
}

/**
 * Prix d’un seul symbole (number | null), basé sur /api/prices.
 */
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  if (!sym) throw new Error("symbol required");
  const { prices = {} } = await apiGetPrices([sym]);
  const val = prices[sym];
  return Number.isFinite(val) ? Number(val) : null;
}
