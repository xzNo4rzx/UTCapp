import React from "react";

const API = "https://utc-api.onrender.com";

export default function PricesProbe() {
  const [out, setOut] = React.useState({ ok:false, msg:"", data:null });

  const run = React.useCallback(async () => {
    try {
      const ping = await fetch(`${API}/ping`).then(r=>r.json());
      const prices = await fetch(`${API}/prices?symbols=BTC,ETH,SOL`).then(r=>r.json());
      setOut({ ok:true, msg:"OK", data:{ ping, prices } });
    } catch (e) {
      setOut({ ok:false, msg:String(e), data:null });
    }
  }, []);

  React.useEffect(() => { run(); const id=setInterval(run, 15_000); return ()=>clearInterval(id); }, [run]);

  return (
    <div style={{
      position:"fixed", right:12, bottom:12, zIndex:9999,
      background:"#0b1020", color:"#d4e3ff", padding:"10px 12px",
      border:"1px solid #2b3555", borderRadius:10, fontFamily:"monospace", fontSize:12
    }}>
      <div style={{marginBottom:6, opacity:0.85}}>PricesProbe</div>
      {out.ok ? (
        <>
          <div>ping: {out.data?.ping?.ok ? "ok" : "ko"}</div>
          <div>prices: {Object.entries(out.data?.prices?.prices || {}).map(([k,v])=>`${k}=${v}`).join("  ") || "—"}</div>
        </>
      ) : (
        <div style={{color:"#ff9e9e"}}>{out.msg || "…"}</div>
      )}
    </div>
  );
}