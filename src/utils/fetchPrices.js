import axios from "axios";

const CACHE_DURATION = 60_000; // 1 minute
let _lastFetch = 0;
let _cache = null;

export default async function fetchPrices() {
  const now = Date.now();
  if (_cache && now - _lastFetch < CACHE_DURATION) {
    return _cache;
  }

  try {
    const resp = await axios.get("https://utc-ai-signal-api.onrender.com/utcapp/variations");
    const data = resp.data;

    if (!Array.isArray(data)) {
      console.warn("❌ Réponse inattendue de /variations :", data);
      return { top5Up: [], top5Down: [], rest: [] };
    }

    const entries = data.map((c) => ({
      symbol: c.symbol,
      currentPrice: c.currentPrice,
      change5min: c.change5min,
      change1d: c.change1d,
      change7d: c.change7d,
    }));

    const sorted5min = [...entries].sort((a, b) => b.change5min - a.change5min);
    const top5Up = sorted5min.slice(0, 5);
    const top5Down = sorted5min.slice(-5).reverse();
    const rest = entries.filter(
      (e) =>
        !top5Up.some((u) => u.symbol === e.symbol) &&
        !top5Down.some((d) => d.symbol === e.symbol)
    );

    const result = { top5Up, top5Down, rest };

    _cache = result;
    _lastFetch = now;
    return result;
  } catch (err) {
    console.error("❌ Erreur fetchPrices (API variations) :", err);
    return { top5Up: [], top5Down: [], rest: [] };
  }
}