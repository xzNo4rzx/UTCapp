// src/utils/fetchSignals.js

const fetchSignals = async () => {
  try {
    const res = await fetch("https://utc-ai-signal-api.onrender.com/utcapp/signals", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // 🔁 Support des deux formats : tableau direct ou { signals: [...] }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.signals)) return data.signals;

    return [];
  } catch (err) {
    console.error("❌ Erreur fetch /utcapp/signals :", err.message || err);
    return [];
  }
};

export default fetchSignals;