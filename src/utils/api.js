// src/utils/api.js

// Mappe ['BTC','ETH', ...] --> appelle le backend en ['BTCUSDT','ETHUSDT', ...],
// puis remappe la réponse {BTCUSDT: 12345} --> {BTC: 12345}
export async function apiGetPrices(symbols = []) {
  const uniq = [...new Set(symbols.map(s => String(s || '').toUpperCase()))].filter(Boolean);
  if (uniq.length === 0) return { prices: {} };

  const pairs = uniq.map(s => (s.endsWith('USDT') ? s : `${s}USDT`));
  const qs = new URLSearchParams({ symbols: pairs.join(',') }).toString();

  const res = await fetch(`/api/prices?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const raw = await res.json(); // ex: { BTCUSDT: 12345.67, ETHUSDT: 2345.89 }
  const prices = {};
  for (const [pair, val] of Object.entries(raw || {})) {
    const base = pair.replace(/USDT$/i, '');
    const num = Number(val);
    if (Number.isFinite(num)) prices[base] = num;
  }
  return { prices };
}
