// src/utils/fetchPrices.js
import axios from "axios";

const CACHE_DURATION = 60_000;
let _lastFetch = 0;
let _cache = null;

export default async function fetchPrices() {
  const now = Date.now();
  if (_cache && now - _lastFetch < CACHE_DURATION) {
    return _cache;
  }

  try {
    const resp = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h,7d"
        },
      }
    );

    const data = resp.data;
    const history = JSON.parse(localStorage.getItem("price_history") || "{}");

    const entries = data.map((c) => {
      const symbol       = c.symbol.toUpperCase();
      const currentPrice = c.current_price;
      const nowTs        = Date.now();

      // --- historique local pour 5min
      history[symbol] = history[symbol] || [];
      history[symbol].push({ timestamp: nowTs, price: currentPrice });
      // on ne garde que 7j max
      history[symbol] = history[symbol].filter(e => nowTs - e.timestamp <= 7*24*60*60*1000);
      localStorage.setItem("price_history", JSON.stringify(history));

      //cherche le prix d’il y a 5 min
      const cutoff5 = nowTs - 5*60*1000;
      const past5   = history[symbol].find(e => e.timestamp <= cutoff5);
      const change5 = past5 ? (currentPrice - past5.price) / past5.price * 100 : 0;

      // on utilise directement la variation 24h et 7j renvoyée par l’API
      const change1d = c.price_change_percentage_24h ?? 0;
      const change7d = c.price_change_percentage_7d_in_currency ?? 0;

      return { symbol, currentPrice, change5min: change5, change1d, change7d };
    });

    // on détermine top5Up / top5Down / rest comme avant
    const sorted5 = [...entries].sort((a,b) => b.change5min - a.change5min);
    const top5Up   = sorted5.slice(0,5);
    const top5Down = sorted5.slice(-5).reverse();
    const rest     = entries.filter(e =>
      !top5Up.some(u => u.symbol===e.symbol) &&
      !top5Down.some(d => d.symbol===e.symbol)
    );

    _cache = { top5Up, top5Down, rest };
    _lastFetch = now;
    return _cache;

  } catch (err) {
    console.error("Erreur fetchPrices :", err);
    throw err;
  }
}