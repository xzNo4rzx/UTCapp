// Utils d'accès API backend

// /api/prices : accepte ?symbols=BTCUSDT,ETHUSDT… et renvoie { BTCUSDT: 12345, ETHUSDT: 2345 }
export async function apiGetPrices(symbols = []) {
  const uniq = [...new Set(symbols.map(s => String(s || '').toUpperCase()))].filter(Boolean);
  if (uniq.length === 0) return { prices: {} };

  const pairs = uniq.map(s => (s.endsWith('USDT') ? s : `${s}USDT`));
  const qs = new URLSearchParams({ symbols: pairs.join(',') }).toString();

  const res = await fetch(`/api/prices?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const raw = await res.json(); // ex: { BTCUSDT: 12345.67 }
  const prices = {};
  for (const [pair, val] of Object.entries(raw || {})) {
    const base = pair.replace(/USDT$/i, '');
    const num = Number(val);
    if (Number.isFinite(num)) prices[base] = num;
  }
  return { prices };
}

// /api/prices (version 1 symbole) -> number | null
export async function apiGetPrice(symbol) {
  const sym = String(symbol || '').toUpperCase();
  const { prices } = await apiGetPrices([sym]);
  return prices?.[sym] ?? null;
}

// /api/candles : accepte ?symbol=BTCUSDT&interval=1m&limit=500[&startTime=..&endTime=..]
// Renvoie un tableau de bougies [{open_time,open,high,low,close,volume}, ...]
export async function apiGetKlines({ symbol, interval = '1m', limit = 500, startTime, endTime } = {}) {
  const base = String(symbol || '').toUpperCase();
  const pair = base.endsWith('USDT') ? base : `${base}USDT`;

  const qs = new URLSearchParams({ symbol: pair, interval, limit: String(limit) });
  if (startTime) qs.set('startTime', String(startTime));
  if (endTime)   qs.set('endTime',   String(endTime));

  const res = await fetch(`/api/candles?${qs.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
