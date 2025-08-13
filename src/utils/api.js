// ===== API CLIENT (robuste) ===================================================
// Remplace par l'URL EXACTE de ton backend Render 
export const API_BASE = "https://utc-api.onrender.com";

// --- utilitaires --------------------------------------------------------------
async function safeParseJSON(res, url) {
  const text = await res.text();
  // Si c'est du HTML (erreur/proxy/404), on stoppe net pour éviter "Unexpected token '<'"
  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    console.error(`❌ HTML reçu au lieu de JSON → ${url}`);
    console.error(trimmed.slice(0, 250) + "...");
    throw new Error("HTML received instead of JSON");
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ JSON parse error sur ${url}:`, e);
    console.error(trimmed.slice(0, 250) + "...");
    throw e;
  }
}

async function getJSON(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      // On tente quand même de lire le corps pour logger proprement
      try { await safeParseJSON(res.clone(), url); } catch {}
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await safeParseJSON(res, url);
  } catch (err) {
    console.error(`Erreur API ${path}:`, err);
    // On renvoie une forme sûre pour ne pas casser l'app
    return {};
  }
}

function qs(obj = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) p.set(k, v.join(","));
    else if (v != null) p.set(k, String(v));
  }
  return p.toString() ? `?${p.toString()}` : "";
}

// --- endpoints utilisés -------------------------------------------------------

// GET /prices?symbols=BTCUSDT,ETHUSDT
// Response attendue: { prices: { BTCUSDT: 12345.6, ... } }
export async function apiGetPrices(symbols = []) {
  const q = qs({ symbols });
  const data = await getJSON(`/prices${q}`);
  return { prices: data?.prices || {} };
}

// Prix d’un seul symbole via /prices (utile pour IATrader et BUY/SELL)
export async function apiGetPrice(symbol) {
  const sym = String(symbol || "").toUpperCase();
  if (!sym) throw new Error("symbol required");
  const { prices } = await apiGetPrices([sym]);
  const val = prices[sym];
  return Number.isFinite(val) ? Number(val) : null;
}

// GET /klines?symbol=BTCUSDT&interval=1m&limit=500
export async function apiGetKlines({ symbol, interval = "1m", limit = 500 }) {
  const q = qs({ symbol, interval, limit });
  const data = await getJSON(`/klines${q}`);
  return { klines: data?.klines || data || [] };
}

// POST /signals/tick  → { ok: true }
export async function apiTickSignals() {
  return await getJSON(`/signals/tick`, {
    method: "POST",
    body: "{}",
  });
}

// GET /signals/latest → { signals: [...] }
export async function apiLatestSignals() {
  const data = await getJSON(`/signals/latest`);
  return { signals: data?.signals || [] };
}
