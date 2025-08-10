import { useState } from "react";
import { apiPost } from "../lib/api";

export default function TradingTile({ symbol, price, onTraded }) {
  const [amountUSD, setAmountUSD] = useState("");
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  const p = Number(price || 0);

  const doBuy = async () => {
    if (!p || !amountUSD) return;
    setLoading(true);
    try {
      const out = await apiPost("/trade/buy", { symbol, amountUSD: Number(amountUSD), price: p });
      onTraded?.(out);
      setAmountUSD("");
    } finally {
      setLoading(false);
    }
  };

  const doSell = async () => {
    if (!p || !qty) return;
    setLoading(true);
    try {
      const out = await apiPost("/trade/sell", { symbol, qty: Number(qty), price: p });
      onTraded?.(out);
      setQty("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tile">
      <div className="tile__head">
        <div className="tile__sym">{symbol}</div>
        <div className="tile__px">{p ? p.toLocaleString() : "-"}</div>
      </div>

      <div className="tile__row">
        <input
          type="number"
          placeholder="USD"
          value={amountUSD}
          onChange={(e) => setAmountUSD(e.target.value)}
        />
        <button disabled={loading || !amountUSD} onClick={doBuy}>Buy</button>
      </div>

      <div className="tile__row">
        <input
          type="number"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button disabled={loading || !qty} onClick={doSell}>Sell</button>
      </div>
    </div>
  );
}
