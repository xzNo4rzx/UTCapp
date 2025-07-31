// src/utils/fetchPrices.js
import axios from "axios";

const CACHE_DURATION = 60_000;  // 1 minute de cache
let _lastFetch = 0;
let _cache = null;

// 📁 Mini-historique stocké dans localStorage pour le 5 min
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("price_history")) || {};
  } catch {
    return {};
  }
}
function saveHistory(history) {
  localStorage.setItem("price_history", JSON.stringify(history));
}

// 📈 Calcul simple de % de variation
function getChangePercent(now, past) {
  if (!past || past === 0) return 0;
  return ((now - past) / past) * 100;
}

export default async function fetchPrices() {
  const now = Date.now();
  if (_cache && now - _lastFetch < CACHE_DURATION) {
    return _cache;
  }

  // Appel CoinGecko pour récupérer les variations 24h et 7j
  const resp = await axios.get(
    "https://api.coingecko.com/api/v3/coins/markets",
    {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h,7d",
      },
    }
  );

  const data = resp.data;
  const history = getHistory();

  const entries = data.map((c) => {
    const symbol = c.symbol.toUpperCase();
    const currentPrice = c.current_price;
    const ts = now;

    // ─── Enregistrer l’historique pour calculer le 5 min
    if (!history[symbol]) history[symbol] = [];
    history[symbol].push({ timestamp: ts, price: currentPrice });

    // purger les données de plus de 7 jours
    history[symbol] = history[symbol].filter(
      (e) => ts - e.timestamp <= 7 * 24 * 60 * 60 * 1000
    );

    // fonction pour retrouver le prix le plus proche de targetTime (<=)
    const findOldPrice = (minutesAgo) => {
      const target = ts - minutesAgo * 60 * 1000;
      // tous les enregistrements antérieurs à target
      const pastEntries = history[symbol].filter((e) => e.timestamp <= target);
      if (pastEntries.length === 0) return null;
      // choisir celui avec le timestamp le plus proche de target
      const closest = pastEntries.reduce((prev, curr) =>
        Math.abs(curr.timestamp - target) < Math.abs(prev.timestamp - target)
          ? curr
          : prev
      );
      return closest.price;
    };

    const price5min = findOldPrice(5);
    const change5min = getChangePercent(currentPrice, price5min);

    // ─── Variations récupérées directement
    const change1d = c.price_change_percentage_24h_in_currency ?? 0;
    const change7d = c.price_change_percentage_7d_in_currency ?? 0;

    return {
      symbol,
      currentPrice,
      change5min,
      change1d,
      change7d,
    };
  });

  saveHistory(history);

  // tri et découpage pour top movers sur 5 min
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
}