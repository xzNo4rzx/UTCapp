// src/utils/iaSignals.js

/**
 * Génère des signaux "buy" et "sell" à partir de séries chronologiques.
 * - achat quand le point courant est un creux local (inférieur à son voisin précédent et suivant).
 * - vente quand c'est un pic local.
 */
export function generateSignals(data) {
  const signals = [];
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].close;
    const curr = data[i].close;
    const next = data[i + 1].close;
    if (curr < prev && curr < next) {
      signals.push({ time: data[i].time, price: curr, action: "buy" });
    } else if (curr > prev && curr > next) {
      signals.push({ time: data[i].time, price: curr, action: "sell" });
    }
  }
  return signals;
}