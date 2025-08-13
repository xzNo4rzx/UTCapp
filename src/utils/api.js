const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:10000";

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { "Content-Type":"application/json", ...(opts.headers||{}) }});
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(`API ${res.status} ${url}: ${text}`);
    return data;
  } catch {
    // Renvoie une erreur claire quand l'API retourne du HTML/404
    throw new Error(`API non-JSON (${res.status}) ${url}: ${text.slice(0,120)}…`);
  }
}

export async function apiGetPrices(symbols) {
  const list = Array.isArray(symbols) ? symbols.join(",") : String(symbols||"");
  const url = `${API_BASE}/prices?symbols=${encodeURIComponent(list)}`;
  const { prices = {} } = await jsonFetch(url);
  return { prices };
}

export async function apiGetKlines(symbol, interval = "1m", limit = 120) {
  const usp = new URLSearchParams({ symbol, interval, limit: String(limit) });
  const url = `${API_BASE}/klines?${usp.toString()}`;
  return jsonFetch(url);
}

export async function apiLatestSignals(limit = 100) {
  const url = `${API_BASE}/get-latest-signals?limit=${limit}`;
  return jsonFetch(url);
}

export async function apiTickSignals() {
  // Pas de /tick dédié côté API → on mappe sur /get-latest-signals pour compat
  return apiLatestSignals(50);
}

export async function apiTopMovers(window = "5m", limit = 5) {
  const url = `${API_BASE}/top-movers?window=${encodeURIComponent(window)}&limit=${limit}`;
  return jsonFetch(url);
}

// --- single symbol helper (wrapper autour /prices) ---
export async function apiGetPrice(symbol) {
  const syms = [symbol];
  const usp = new URLSearchParams({ symbols: syms.join(",") });
  const url = `${API_BASE}/prices?${usp.toString()}`;
  const { prices = {} } = await jsonFetch(url);

  // On tente la clé telle quelle, puis l’alternative BTC<->BTCUSDT
  const key = symbol;
  const alt = symbol.endsWith("USDT") ? symbol.replace(/USDT$/,"") : symbol + "USDT";
  return prices[key] ?? prices[alt] ?? null;
}
