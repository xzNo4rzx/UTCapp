// src/utils/fetchHistoricalPrices.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = "https://min-api.cryptocompare.com/data";
const headers = { Authorization: `Apikey ${API_KEY}` };

/**
 * Récupère l'historique (minutes, heures ou jours) pour une crypto.
 * @param {string} symbol  ex. "BTC"
 * @param {"minute"|"hour"|"day"} interval
 * @param {number} limit   nombre de points à ramener
 */
export default async function fetchHistoricalPrices(
  symbol,
  interval = "minute",
  limit = 5
) {
  try {
    let url;
    if (interval === "minute") {
      url = `${BASE_URL}/histominute?fsym=${symbol}&tsym=USD&limit=${limit}`;
    } else if (interval === "hour") {
      url = `${BASE_URL}/histohour?fsym=${symbol}&tsym=USD&limit=${limit}`;
    } else {
      url = `${BASE_URL}/histoday?fsym=${symbol}&tsym=USD&limit=${limit}`;
    }

    const resp = await axios.get(url, { headers });
    const data = resp.data.Data;
    if (!Array.isArray(data)) {
      console.error("fetchHistoricalPrices resp.data:", resp.data);
      throw new Error("Format inattendu de l'historique");
    }
    return data;
  } catch (err) {
    console.error("Erreur récupération historiques :", err);
    throw err;
  }
}