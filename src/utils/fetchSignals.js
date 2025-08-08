const API_BASE = ((import.meta.env.VITE_API_BASE||"http://localhost:8000").replace(/\/+$/,""));

const fetchSignals = async () => {
  try {
    const res = await fetch(`${API_BASE}/signals`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.signals)) return data.signals;
    return [];
  } catch (err) {
    console.error("❌ Erreur fetch /signals :", err.message || err);
    return [];
  }
};

export default fetchSignals;