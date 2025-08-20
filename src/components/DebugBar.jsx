import React, { useEffect, useState } from "react";
import { API_BASE, apiGetPrices, apiDeltas } from "../utils/api";

export default function DebugBar() {
  const [ping, setPing] = useState("");
  const [prices, setPrices] = useState(null);
  const [deltas, setDeltas] = useState(null);
  const [err, setErr] = useState("");

  const symbols = "BTCUSDT,ETHUSDT,SOLUSDT";
  const windows = "1m,5m,10m,1h,6h,1d,7d";

  async function doPing() {
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/ping`, { mode: "cors" });
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await r.text();
        throw new Error(`ping non-JSON ${r.status}: ${t.slice(0,80)}`);
      }
      const j = await r.json();
      setPing(j?.ok ? "OK" : JSON.stringify(j));
    } catch (e) {
      setPing("KO");
      setErr(`[ping] ${e.message}`);
    }
  }

  async function doFetch() {
    setErr("");
    try {
      const pr = await apiGetPrices(symbols);
      const dl = await apiDeltas(symbols, windows);
      const p = pr?.prices ?? pr ?? {};
      const d = dl?.deltas ?? dl ?? {};
      setPrices(p);
      setDeltas(d);
    } catch (e) {
      setErr(`[fetch] ${e.message}`);
    }
  }

  useEffect(() => {
    doPing();
    doFetch();
    const id = setInterval(doFetch, 30000);
    return () => clearInterval(id);
  }, []);

  // Échantillons lisibles
  const priceKeys = prices ? Object.keys(prices) : [];
  const deltaKeys = deltas ? Object.keys(deltas) : [];
  const samplePrice = priceKeys[0] ? `${priceKeys[0]}=${prices[priceKeys[0]]}` : "—";
  const sampleDelta = deltaKeys[0] ? `${deltaKeys[0]}: ${JSON.stringify(deltas[deltaKeys[0]])}` : "—";

  return (
    <div style={barStyle}>
      <strong>DebugBar</strong>&nbsp;|&nbsp;
      <span>API_BASE: <code>{API_BASE}</code></span>&nbsp;|&nbsp;
      <span>/ping: <b style={{color: ping === "OK" ? "#22c55e" : "#ef4444"}}>{ping || "…"}</b></span>&nbsp;|&nbsp;
      <button onClick={doFetch} style={btn}>REFRESH</button>
      {err && <span style={{ color: "#f97316", marginLeft: 8 }}>⚠ {err}</span>}
      <div style={{ marginTop: 4, fontSize: 12 }}>
        <div>prices keys: {priceKeys.length} — sample: {samplePrice}</div>
        <div>deltas keys: {deltaKeys.length} — sample: <code>{sampleDelta}</code></div>
      </div>
    </div>
  );
}

const barStyle = {
  position: "fixed",
  left: 10,
  right: 10,
  bottom: 10,
  zIndex: 9999,
  background: "rgba(0,0,0,.85)",
  color: "#ddd",
  border: "1px solid #333",
  padding: "8px 10px",
  borderRadius: 10,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
};

const btn = {
  marginLeft: 8,
  padding: "4px 8px",
  background: "#0ea5e9",
  border: "none",
  borderRadius: 6,
  color: "white",
  cursor: "pointer",
};