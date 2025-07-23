// src/utils/fetchHistoricalPrices.js

import axios from 'axios';

/**
 * Récupère les prix historiques pour un symbole donné.
 *
 * @param {string} symbole - Le symbole de l'actif (ex. 'AAPL', 'BTC', etc.).
 * @returns {Promise<Array<{ date: string, close: number }>>}
 * @throws En cas d’erreur réseau ou de données mal formées.
 */
async function fetchHistoricalPrices(symbole) {
  const url = `https://api.exemple.com/historical/${encodeURIComponent(symbole)}`;

  try {
    const response = await axios.get(url);
    console.log(`Données reçues pour ${symbole} :`, response.data);

    const raw = Array.isArray(response.data.prices) ? response.data.prices : [];
    return raw.map(p => ({ date: p.date, close: p.close }));
  } catch (err) {
    console.error('Erreur récupération historiques :', err);
    throw err;
  }
}

export default fetchHistoricalPrices;