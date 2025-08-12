// ===== API BASE ==============================================================
export const API_BASE =
  (import.meta?.env?.VITE_API_BASE) ||
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  '';

function u(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return API_BASE ? `${API_BASE}${path}` : path;
}

// ===== fetch JSON robuste ====================================================
async function fetchJSON(url, options) {
  const full = u(url);
  console.log("📡 GET:", full);
  const res = await fetch(full, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ NON-JSON:", full, "\nStatus:", res.status, res.statusText, "\nBody:\n", text);
    throw new SyntaxError(`Non-JSON from ${full} (status ${res.status})`);
  }
  if (!res.ok) {
    console.error("❌ HTTP not OK:", full, res.status, data);
    throw new Error(`HTTP ${res.status}`);
  }
  return data;
}

// ===== PRICES ================================================================
export async function apiGetPrices(symbols = []) {
  const uniq = [...new Set(symbols.map(s => String(s || '').toUpperCase()))].filter(Boolean);
  if (uniq.length === 0) return { prices: {} };

  const pairs = uniq.map(s => (s.endsWith('USDT') ? s : `${s}USDT`));
  const qs = new URLSearchParams({ symbols: pairs.join(',') }).toString();

  // /api/prices -> { BTCUSDT: 12345.6, ... }
  const raw = await fetchJSON(`/api/prices?${qs}`);
  const prices = {};
  for (const [pair, val] of Object.entries(raw || {})) {
    const base = pair.replace(/USDT$/i, '');
    const num = Number(val);
    if (Number.isFinite(num)) prices[base] = num;
  }
  return { prices };
}

export async function apiGetPrice(symbol) {
  const sym = String(symbol || '').toUpperCase();
  const { prices } = await apiGetPrices([sym]);
  return prices?.[sym] ?? null;
}

// ===== KLINES ================================================================
// /api/candles?symbol=BTCUSDT&interval=1m&limit=500[&startTime=..&endTime=..]
export async function apiGetKlines({ symbol, interval = '1m', limit = 500, startTime, endTime } = {}) {
  const base = String(symbol || '').toUpperCase();
  const pair = base.endsWith('USDT') ? base : `${base}USDT`;

  const qs = new URLSearchParams({ symbol: pair, interval, limit: String(limit) });
  if (startTime) qs.set('startTime', String(startTime));
  if (endTime)   qs.set('endTime',   String(endTime));

  return await fetchJSON(`/api/candles?${qs.toString()}`);
}

// ===== SIGNALS ===============================================================
export async function apiTickSignals({ symbol, limit = 100 } = {}) {
  const base = String(symbol || '').toUpperCase();
  const pair = base.endsWith('USDT') ? base : `${base}USDT`;
  const qs = new URLSearchParams({ symbol: pair, limit: String(limit) }).toString();
  return await fetchJSON(`/api/tick-signals?${qs}`);
}

export async function apiLatestSignals({ limit = 50 } = {}) {
  const qs = new URLSearchParams({ limit: String(limit) }).toString();
  return await fetchJSON(`/api/latest-signals?${qs}`);
}
