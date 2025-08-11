// FICHIER: src/pages/Trading.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/trading.css";
import TopMovers from "../components/TopMovers.jsx";

const SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT","MATIC","LTC","BCH","UNI","LINK","XLM","ATOM","ETC","FIL",
  "APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO","RNDR","FTM","EGLD","FLOW","GRT","IMX","STX","ENS","CRV","HBAR","CRO"
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "").replace(/\/+$/,"");

function formatUSD(v){
  if(v == null || Number.isNaN(v)) return "—";
  try{
    return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(v);
  }catch(e){ return `$${(+v).toFixed(2)}`; }
}

function VarChip({k, v}){
  let cls = "neutral";
  if(typeof v === "number"){
    if(v > 0) cls = "up";
    else if(v < 0) cls = "down";
  }
  return (
    <div className="tr-chip">
      <span className="k">{k}</span>
      <span className={"v "+cls}>{typeof v==="number" ? `${v>0?"+":""}${v.toFixed(2)}%` : "—"}</span>
    </div>
  );
}

function Row({sym, price, loading}){
  const pair = sym + "/USD";
  return (
    <li className="tr-row">
      <div className="tr-sym">
        <span>{sym}</span>
        <span className="pair">{pair}</span>
      </div>
      <div className="tr-price">{price != null ? formatUSD(price) : loading ? "—" : "—"}</div>
      <div className="tr-vars">
        <VarChip k="1m" v={null} />
        <VarChip k="5m" v={null} />
        <VarChip k="10m" v={null} />
        <VarChip k="1h" v={null} />
        <VarChip k="6h" v={null} />
        <VarChip k="1d" v={null} />
        <VarChip k="7d" v={null} />
      </div>
      <div className="tr-actions">
        <button className="tr-btn buy" disabled>Acheter</button>
        <button className="tr-btn sell" disabled>Vendre</button>
      </div>
    </li>
  );
}

export default function Trading(){
  const [symbols] = useState(SYMBOLS);
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const csv = useMemo(()=> symbols.join(","), [symbols]);

  async function fetchOnce(){
    setErr("");
    try{
      const res = await fetch(`${API_BASE}/prices?symbols=${encodeURIComponent(csv)}`);
      if(!res.ok){
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text.slice(0,180)}`);
      }
      const data = await res.json();
      setMap(data?.prices || {});
    }catch(e){
      setErr(e.message || "fetch error");
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    if(!API_BASE){ setLoading(false); return; }
    fetchOnce();
    const t = setInterval(fetchOnce, 15000);
    return ()=> clearInterval(t);
  }, [csv]);

  const bgStyle = {
    minHeight: "100vh",
    backgroundImage: 'url("/backgrounds/homebackground.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed"
  };

  return (
    <div style={bgStyle}>
      <div className="tr-wrap">
        <div className="tr-header">
          <h1 style={{margin:"0 0 6px 0"}}>💸 Trading</h1>
          <span className="tr-note">1 ligne par crypto • fond verre dépoli • variations 1m/5m/10m/1h/6h/1d/7d</span>
        </div>

        <div style={{margin:"10px 0 18px 0"}}>
          <TopMovers/>
        </div>

        {err ? (
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,0,0,0.08)" }}>
            {err}
          </div>
        ) : null}

        <ul className="tr-list">
          {symbols.map(sym => (
            <Row key={sym} sym={sym} price={map?.[sym]} loading={loading}/>
          ))}
        </ul>
      </div>
    </div>
  );
}
