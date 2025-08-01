const API_BASE = "https://utc-api.onrender.com";

const fetchSignals = async () => {
  try {
    const res = await fetch(`${API_BASE}/utcapp/signals`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // on renvoie soit le tableau direct, soit data.signals
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.signals)) return data.signals;
    return [];
  } catch (err) {
    console.error("❌ Erreur fetch /utcapp/signals :", err.message || err);
    return [];
  }
};

export default fetchSignals;