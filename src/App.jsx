// src/App.jsx
import Trading from "./pages/Trading.jsx";
import './styles/trading.css'
import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Analysis from "./pages/Analysis.jsx";
import Signals from "./pages/Signals.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Admin from "./pages/Admin.jsx";
import PricesProbe from "./components/PricesProbe"; // ajuste le chemin si besoin
import DebugBar from "./components/DebugBar";

// --- DEBUG BAR INLINE (pas d'import, pas d'excuse) -------------------------
function DebugBarInline() {
  const [apiBase, setApiBase] = React.useState("");
  const [ping, setPing] = React.useState("");
  const [prices, setPrices] = React.useState(null);
  const [deltas, setDeltas] = React.useState(null);
  const [err, setErr] = React.useState("");

  // même logique qu'api.js mais en local, pour éviter tout souci d'import
  const _API_BASE = (() => {
    try {
      const env = import.meta?.env?.VITE_API_BASE?.trim?.();
      if (env) return env.replace(/\/+$/, "");
    } catch {}
    return `${location.origin}/api`.replace(/\/+$/, "");
  })();

  async function _json(url, opts) {
    const r = await fetch(url, { ...opts, headers: { "Content-Type":"application/json", ...(opts?.headers||{}) } });
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const t = await r.text();
      throw new Error(`non-JSON ${r.status} ${url}: ${t.slice(0,120)}`);
    }
    if (!r.ok) {
      const j = await r.json().catch(()=> ({}));
      throw new Error(`HTTP ${r.status} ${url}: ${JSON.stringify(j)}`);
    }
    return r.json();
  }

  async function doPing() {
    setErr("");
    try {
      const j = await _json(`${_API_BASE}/ping`);
      setPing(j?.ok ? "OK" : JSON.stringify(j));
    } catch (e) {
      setPing("KO");
      setErr(`[ping] ${e.message}`);
    }
  }

  async function doFetch() {
    setErr("");
    try {
      const symbols = "BTCUSDT,ETHUSDT,SOLUSDT";
      const pr = await _json(`${_API_BASE}/prices?symbols=${encodeURIComponent(symbols)}`);
      const dl = await _json(`${_API_BASE}/deltas?symbols=${encodeURIComponent(symbols)}&windows=1m,5m,10m,1h,6h,1d,7d`);
      setPrices(pr?.prices ?? pr ?? {});
      setDeltas(dl?.deltas ?? dl ?? {});
    } catch (e) {
      setErr(`[fetch] ${e.message}`);
    }
  }

  React.useEffect(() => {
    console.log("🔧 DebugBarInline mounted");
    setApiBase(_API_BASE);
    doPing();
    doFetch();
    const id = setInterval(doFetch, 30000);
    return () => clearInterval(id);
  }, []);

  const pKeys = prices ? Object.keys(prices) : [];
  const dKeys = deltas ? Object.keys(deltas) : [];
  const sampleP = pKeys[0] ? `${pKeys[0]}=${prices[pKeys[0]]}` : "—";
  const sampleD = dKeys[0] ? `${dKeys[0]}: ${JSON.stringify(deltas[dKeys[0]])}` : "—";

  return (
    <div style={{
      position:"fixed", left:10, right:10, bottom:10,
      background:"rgba(0,0,0,.92)", color:"#ddd",
      border:"1px solid #333", borderRadius:10, padding:"8px 10px",
      fontFamily:"ui-monospace,Menlo,monospace", fontSize:13,
      zIndex: 2147483647, boxShadow:"0 4px 18px rgba(0,0,0,.5)"
    }}>
      <strong>Debug</strong>&nbsp;|&nbsp;
      API_BASE: <code>{apiBase}</code>&nbsp;|&nbsp;
      /ping: <b style={{color: ping==="OK"?"#22c55e":"#ef4444"}}>{ping||"…"}</b>&nbsp;|&nbsp;
      <button onClick={doFetch} style={{marginLeft:8,padding:"4px 8px",border:"none",borderRadius:6,background:"#0ea5e9",color:"#fff",cursor:"pointer"}}>
        REFRESH
      </button>
      {err && <span style={{ marginLeft:8, color:"#f97316" }}>⚠ {err}</span>}
      <div style={{ marginTop:4, fontSize:12 }}>
        <div>prices keys: {pKeys.length} — sample: {sampleP}</div>
        <div>deltas keys: {dKeys.length} — sample: <code>{sampleD}</code></div>
      </div>
    </div>
  );
}

const App = () => {
  useEffect(() => {
    console.log("✅ UTC App initialisée avec routes.");
  }, []);
  console.log("✅ App.jsx chargé");

<DebugBar />

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/trading" element={<PrivateRoute><Trading /></PrivateRoute>} />
        <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
        <Route path="/signals" element={<PrivateRoute><Signals /></PrivateRoute>} />
        <Route path="/ia-trader" element={<PrivateRoute><Trading /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<Admin />} />
        
      </Routes>
      <PricesProbe />
    </>
  );
};

export default App;
