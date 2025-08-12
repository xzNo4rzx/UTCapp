// utils/api.js — robuste: log en clair quand la réponse n'est pas JSON

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ Réponse non-JSON:", url, "\nStatus:", res.status, res.statusText, "\n--- BODY ---\n", text, "\n-------------");
    throw new SyntaxError(`Non-JSON from ${url} (status ${res.status})`);
  }
  if (!res.ok) {
    console.error("❌ HTTP not OK:", url, res.status, res.statusText, data);
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return data;
}

// /api/prices?symbols=BTCUSDT,ETHUSDT => { BTCUSDT: 12345, ETHUSDT: 2345 }
export async function apiGetPrices(symbols = []) {
  const uniq = [...new Set(symbols.map(s => String(s || '').toUpperCase()))].filter(Boolean);
  if (uniq.length === 0) return { prices: {} };

  const pairs = uniq.map(s => (s.endsWith('USDT') ? s : `${s}USDT`));
  const qs = new URLSearchParams({ symbols: pairs.join(',') }).toString();

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

// /api/candles?symbol=BTCUSDT&interval=1m&limit=500[&startTime=..&endTime=..]
export async function apiGetKlines({ symbol, interval = '1m', limit = 500, startTime, endTime } = {}) {
  const base = String(symbol || '').toUpperCase();
  const pair = base.endsWith('USDT') ? base : `${base}USDT`;

  const qs = new URLSearchParams({ symbol: pair, interval, limit: String(limit) });
  if (startTime) qs.set('startTime', String(startTime));
  if (endTime)   qs.set('endTime',   String(endTime));

  return await fetchJSON(`/api/candles?${qs.toString()}`);
}

// /api/tick-signals?symbol=BTCUSDT&limit=100
export async function apiTickSignals({ symbol, limit = 100 } = {}) {
  const base = String(symbol || '').toUpperCase();
  const pair = base.endsWith('USDT') ? base : `${base}USDT`;
  const qs = new URLSearchParams({ symbol: pair, limit: String(limit) }).toString();
  return await fetchJSON(`/api/tick-signals?${qs}`);
}

// /api/latest-signals?limit=50
export async function apiLatestSignals({ limit = 50 } = {}) {
  const qs = new URLSearchParams({ limit: String(limit) }).toString();
  return await fetchJSON(`/api/latest-signals?${qs}`);
}
