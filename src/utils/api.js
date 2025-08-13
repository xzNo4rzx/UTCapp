const API_BASE = "https://utc-api.onrender.com";

function buildURL(path, params) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (params) for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  return url.toString();
}

async function jsonFetch(path, { method = "GET", body, params, headers } = {}) {
  const url = buildURL(path, params);
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return JSON.parse(txt); }
  catch {
    const snip = txt.slice(0, 200);
    throw new Error(`API ${res.status} non‑JSON @ ${url}\n---\n${snip}\n---`);
  }
}

export const apiPing          = () => jsonFetch("/ping");
export const apiMeInit        = () => jsonFetch("/me/init");
export const apiGetPrice      = (symbol) =>
  jsonFetch(`/price/${encodeURIComponent(String(symbol || "").toUpperCase())}`);
export const apiGetPrices     = (symbols) => {
  const arr = (Array.isArray(symbols) ? symbols : String(symbols || "").split(","))
    .map((s) => String(s || "").trim().toUpperCase())
    .filter(Boolean);
  return jsonFetch("/prices", { params: { symbols: arr.join(",") } });
};
export const apiGetKlines     = (symbol, interval = "1m", limit = 120) =>
  jsonFetch("/klines", {
    params: {
      symbol: String(symbol || "").toUpperCase(),
      interval,
      limit,
    },
  });

export const apiGetDeltas     = (symbols, windows = "1m,5m,10m,1h,6h,1d,7d") => {
  const arr = (Array.isArray(symbols) ? symbols : String(symbols || "").split(","))
    .map((s) => String(s || "").trim().toUpperCase())
    .filter(Boolean);
  return jsonFetch("/deltas", { params: { symbols: arr.join(","), windows } });
};

export const apiTopMovers     = (window = "5m", limit = 5) =>
  jsonFetch("/top-movers", { params: { window, limit } });

export const apiLatestSignals = (limit = 100) =>
  jsonFetch("/get-latest-signals", { params: { limit } });

export const apiTickSignals   = (limit = 100) => apiLatestSignals(limit);

export { API_BASE };
