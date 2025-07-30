// src/utils/fetchSignals.js
const fetchSignals = async () => {
  try {
    const res = await fetch("https://utc-ai-signal-api.onrender.com/utcapp/signals");
    const data = await res.json();

    if (Array.isArray(data)) {
      // ancien format brut : on convertit
      return { signals: data };
    }

    if (Array.isArray(data.signals)) {
      // format déjà correct
      return data;
    }

    return { signals: [] };
  } catch (err) {
    console.error("❌ Erreur fetch /utcapp/signals", err);
    return { signals: [] };
  }
};

export default fetchSignals;