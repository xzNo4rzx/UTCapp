// src/utils/fetchPrices.js

import fetchHistoricalPrices from './fetchHistoricalPrices.js';

export default async function fetchPrices(symbole) {
  try {
    const historique = await fetchHistoricalPrices(symbole);
    console.log(`Historique des prix pour ${symbole}:`, historique);
    return historique;
  } catch (err) {
    console.error(`Erreur lors de la récupération des prix pour ${symbole}:`, err);
    throw err;
  }
}