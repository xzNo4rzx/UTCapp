import React, { useContext } from "react";
import { PortfolioContext } from "../context/PortfolioContext";

const Profile = () => {
  const { portfolio, reset } = useContext(PortfolioContext);
  if (!portfolio) return <div>Chargement…</div>;

  const {
    id,
    startDate,
    cash,
    invested,
    pnlPercent,
    cumulativeUsd,
    cumulativePercent,
    positions,
    history
  } = portfolio;

  const symbols = Object.keys(positions);
  // calcul des stats de trades
  const sells = history.filter(t=>t.type==='sell');
  const posCount = sells.filter(t=>t.price>t.entryPrice).length;
  const totCount = sells.length;

  const fmt = v => typeof v==="number"?v.toFixed(2):"0.00";

  return (
    <div style={{padding:20,background:"#121212",color:"#eee",minHeight:"100vh",fontFamily:"sans-serif"}}>
      <h1>👤 Profil utilisateur</h1>
      <section style={{margin:"20px 0",padding:16,background:"#1e1e1e",borderRadius:6}}>
        <h2>💼 Bilan PT {id}</h2>
        <p>Ouvert le : {new Date(startDate).toLocaleString()}</p>
        <p>Cash disponible    : ${fmt(cash)}</p>
        <p>Montant investi   : ${fmt(invested)}</p>
        <p>P&L investi       : {fmt(pnlPercent)}%</p>
        <p>P&L global        : ${fmt(cumulativeUsd)} ({fmt(cumulativePercent)}%)</p>
        <p>Trades gagnants   : {posCount} / {totCount}</p>
        <button onClick={reset} style={{marginTop:8,padding:"8px 16px",background:"#ff4d4f",color:"#fff",border:"none",borderRadius:4,cursor:"pointer"}}>🔄 Réinitialiser</button>
      </section>

      <section style={{margin:"20px 0"}}>
        <h2>📊 Positions détaillées</h2>
        {symbols.length===0? <p>Aucune position ouverte.</p> : (
          <div style={{overflowX:"auto"}}>
            <table style={{minWidth:600,borderCollapse:"collapse",width:"100%"}}>
              <thead>
                <tr>{["Crypto","Date achat","Prix achat","Actuel","Δ%","Δ $"].map(h=>(
                  <th key={h} style={{border:"1px solid #444",padding:8,whiteSpace:"nowrap",background:"#2a2a2a"}}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {symbols.map((s,i)=>{
                  const p=positions[s];
                  const entryDate=new Date(p.entryDate).toLocaleString();
                  const current=p.currentPrice;
                  const investedVal=p.amount*p.avgPrice;
                  const currentVal=p.amount*current;
                  const pct = investedVal>0?(currentVal-investedVal)/investedVal*100:0;
                  const usd = currentVal-investedVal;
                  return (
                    <tr key={s} style={{background:i%2===0?"#1e1e1e":"#232323"}}>
                      <td style={{border:"1px solid #444",padding:8}}>{s}</td>
                      <td style={{border:"1px solid #444",padding:8}}>{entryDate}</td>
                      <td style={{border:"1px solid #444",padding:8}}>${fmt(p.avgPrice)}</td>
                      <td style={{border:"1px solid #444",padding:8}}>${fmt(current)}</td>
                      <td style={{border:"1px solid #444",padding:8}}>{fmt(pct)}%</td>
                      <td style={{border:"1px solid #444",padding:8}}>${fmt(usd)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{margin:"20px 0"}}>
        <h2>📝 Historique des trades</h2>
        {history.length===0? <p>Aucun trade.</p> : (
          <div style={{overflowX:"auto",maxHeight:300,overflowY:"auto"}}>
            <table style={{minWidth:800,borderCollapse:"collapse",width:"100%"}}>
              <thead>
                <tr>{["Date","Type","Crypto","Montant","Prix"].map(h=>(
                  <th key={h} style={{border:"1px solid #444",padding:8,whiteSpace:"nowrap",background:"#2a2a2a"}}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {history.map((t,i)=>(
                  <tr key={i} style={{background:i%2===0?"#1e1e1e":"#232323"}}>
                    <td style={{border:"1px solid #444",padding:8}}>{new Date(t.date).toLocaleString()}</td>
                    <td style={{border:"1px solid #444",padding:8}}>{t.type.toUpperCase()}</td>
                    <td style={{border:"1px solid #444",padding:8}}>{t.symbol}</td>
                    <td style={{border:"1px solid #444",padding:8}}>${fmt(t.amountUsd)}</td>
                    <td style={{border:"1px solid #444",padding:8}}>${fmt(t.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;