import { useEffect, useMemo, useState } from "react";
import TradingTile from "../components/TradingTile";
import { API_BASE_URL } from "../lib/api";

const DEFAULT_SYMBOLS = [
  "BTC","ETH","SOL","XRP","ADA","DOGE","SHIB","AVAX","TRX","DOT","MATIC","LTC","BCH","UNI","LINK","XLM",
  "ATOM","ETC","FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO","RNDR","FTM",
  "EGLD","FLOW","GRT","IMX","STX","ENS","CRV","HBAR","CRO"
];

export default function TradingTiles() {
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => symbols.join(","), [symbols]);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/prices?symbols=${encodeURIComponent(query)}`);
        const js = await res.json();
        if (alive && js?.prices) setPrices(js.prices);
      } catch {}
      finally { setLoading(false); }
    }
    pull();
    const id = setInterval(pull, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [query]);

  const onTraded = () => {
    // place pour rafraîchir portefeuille si besoin (via contexte)
  };

  return (
    <div className="trading-grid">
      <div className="trading-grid__bar">
        <h2>Trading</h2>
        <div className="muted">{loading ? "maj…" : "à jour"}</div>
      </div>
      <div className="trading-grid__wrap">
        {symbols.map(sym => (
          <TradingTile key={sym} symbol={sym} price={prices[sym]} onTraded={onTraded} />
        ))}
      </div>
    </div>
  );
}
