// src/utils/fetchPrices.js
import axios from "axios";

const CACHE_DURATION = 60_000;
let _lastFetch = 0;
let _cache = null;

// 📁 Historique stocké dans localStorage
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

// 📈 Calcule variation entre deux valeurs
function getChangePercent(now, past) {
  if (!past || past === 0) return 0;
  return ((now - past) / past) * 100;
}

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
        },
      }
    );

    const data = resp.data;
    const history = getHistory();

    const entries = data.map((c) => {
      const symbol = c.symbol.toUpperCase();
      const currentPrice = c.current_price;
      const nowTimestamp = Date.now();

      // ⏱️ Enregistrement historique
      if (!history[symbol]) history[symbol] = [];
      history[symbol].push({ timestamp: nowTimestamp, price: currentPrice });

      // ❌ On garde uniquement les valeurs < 7j
      history[symbol] = history[symbol].filter(
        (entry) => nowTimestamp - entry.timestamp <= 7 * 24 * 60 * 60 * 1000
      );

      // 🔍 Trouver les prix anciens
      const findOldPrice = (minutesAgo) => {
        const targetTime = nowTimestamp - minutesAgo * 60 * 1000;
        const past = history[symbol].find(
          (entry) => entry.timestamp <= targetTime
        );
        return past?.price ?? null;
      };

      const price5min = findOldPrice(5);
      const price1d = findOldPrice(60 * 24);
      const price7d = findOldPrice(60 * 24 * 7);

      return {
        symbol,
        currentPrice,
        change5min: getChangePercent(currentPrice, price5min),
        change1d: getChangePercent(currentPrice, price1d),
        change7d: getChangePercent(currentPrice, price7d),
      };
    });

    saveHistory(history);

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
    console.error("Erreur fetchPrices (CoinGecko) :", err);
    throw err;
  }
}