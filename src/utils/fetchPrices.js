// src/utils/fetchPrices.js
import axios from "axios";

const CACHE_DURATION = 60_000;  // 1 minute
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
  // Retour cache si encore valide
  if (_cache && now - _lastFetch < CACHE_DURATION) {
    return _cache;
  }

  // Appel CoinGecko avec price_change_percentage pour 24h et 7d
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

  const data = resp.data; // tableau d’objets CoinGecko
  const history = getHistory();

  const entries = data.map((c) => {
    const symbol = c.symbol.toUpperCase();
    const currentPrice = c.current_price;
    const ts = Date.now();

    // ─── Enregistrer l’historique pour le 5m
    if (!history[symbol]) history[symbol] = [];
    history[symbol].push({ timestamp: ts, price: currentPrice });

    // ne garder que 7 jours max
    history[symbol] = history[symbol].filter(
      (e) => ts - e.timestamp <= 7 * 24 * 60 * 60 * 1000
    );

    // fonction pour retrouver le prix il y a X minutes
    const findOldPrice = (minutesAgo) => {
      const target = ts - minutesAgo * 60 * 1000;
      const past = history[symbol].find((e) => e.timestamp <= target);
      return past ? past.price : null;
    };

    const price5min = findOldPrice(5);
    const change5min = getChangePercent(currentPrice, price5min);

    // ─── Variations récupérées DIRECTEMENT via CoinGecko
    // 24h
    const change1d = c.price_change_percentage_24h_in_currency ?? 0;
    // 7 jours
    const change7d = c.price_change_percentage_7d_in_currency ?? 0;

    return {
      symbol,
      currentPrice,
      change5min,
      change1d,
      change7d,
    };
  });

  // sauvegarde l’historique mis à jour
  saveHistory(history);

  // tri sur la variation 5min pour top movers
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