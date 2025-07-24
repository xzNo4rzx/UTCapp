// src/utils/fetchPrices.js
import axios from "axios";

const CACHE_DURATION = 60_000;
let _lastFetch = 0;
let _cache     = null;

export default async function fetchPrices() {
  const now = Date.now();
  if (_cache && now - _lastFetch < CACHE_DURATION) {
    return _cache;
  }

  try {
    // On récupère le top 50 par capitalisation (+ % 24h)
    const resp = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency:      "usd",
          order:            "market_cap_desc",
          per_page:         50,
          page:             1,
          sparkline:        false,
          price_change_percentage: "24h"
        }
      }
    );

    const data = resp.data; // tableau d’objets CoinGecko
    // On construit notre format unifié
    const entries = data.map((c) => ({
      symbol:        c.symbol.toUpperCase(),
      currentPrice:  c.current_price,
      changePercent: c.price_change_percentage_24h ?? 0,
      // on peut enrichir ici si besoin (1h, 7d…)  
    }));

    // Tri et découpage
    const sorted24h = [...entries].sort((a, b) =>
      b.changePercent - a.changePercent
    );
    const top5Up   = sorted24h.slice(0, 5);
    const top5Down = sorted24h.slice(-5).reverse();
    const rest     = entries.filter(
      (e) =>
        !top5Up.some((u) => u.symbol === e.symbol) &&
        !top5Down.some((d) => d.symbol === e.symbol)
    );

    const result = { top5Up, top5Down, rest };

    _cache     = result;
    _lastFetch = now;
    return result;
  } catch (err) {
    console.error("Erreur fetchPrices (CoinGecko) :", err);
    throw err;
  }
}