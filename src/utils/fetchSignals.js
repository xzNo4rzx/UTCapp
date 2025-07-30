// src/utils/fetchSignals.js
const fetchSignals = async () => {
  try {
    const res = await fetch("https://utc-ai-signal-api.onrender.com/utcapp/signals");
    const data = await res.json();

    // On renvoie directement la liste
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.signals)) {
      return data.signals;
    }

    return [];
  } catch (err) {
    console.error("❌ Erreur fetch /utcapp/signals", err);
    return [];
  }
};

export default fetchSignals;