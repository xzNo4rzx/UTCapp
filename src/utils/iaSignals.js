// src/utils/iaSignals.js

/**
 * Génère des signaux "buy" et "sell" à partir de séries chronologiques.
 * - BUY : creux local (inférieur à ses voisins) → 🟢
 * - SELL : pic local (supérieur à ses voisins) → 🔴
 * Format de retour compatible avec signal_engine : timestamp, type, score, risk, explanation.
 */
export function generateSignals(data, symbol = "BTC") {
  const signals = [];
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].close;
    const curr = data[i].close;
    const next = data[i + 1].close;

    if ((curr < prev && curr < next) || (curr > prev && curr > next)) {
      const type = curr < prev && curr < next ? "BUY" : "SELL";
      const variation = ((next - prev) / prev) * 100;
      const score = Math.abs(variation) / 2;
      const risk = score >= 1 ? "🟡 Moyen" : "🟢 Faible";

      signals.push({
        timestamp: new Date(data[i].time).toISOString(),
        crypto: symbol,
        type,
        type_ia: "pattern_local",
        score: parseFloat(score.toFixed(2)),
        risk,
        explanation: [
          `Détection d’un ${type === "BUY" ? "creux" : "pic"} local via variation de prix.`,
          `📉 Prix précédent : ${prev}`,
          `📊 Prix actuel : ${curr}`,
          `📈 Prix suivant : ${next}`,
          `🔁 Variation approx. : ${variation.toFixed(2)}%`,
        ],
      });
    }
  }
  return signals;
}