const fetchSignals = async () => {
  try {
    const res = await fetch("https://utc-ai-signal-api.onrender.com/utcapp/signals");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Erreur fetch /utcapp/signals", err);
    return [];
  }
};

export default fetchSignals;