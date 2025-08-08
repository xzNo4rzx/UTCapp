// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/CryptoList.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { useContext, useMemo, useState } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "./SellModal";

// ==== [BLOC: HELPERS] =======================================================
const fmtPrice = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};
const fmtPct = (n) =>
  typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(2)}%` : "—";

// ==== [BLOC: MODALE ACHAT] ==================================================
const BuyModal = ({ show, symbol, amount, onChangeAmount, onClose, onConfirm }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
      <div style={{ width: "min(520px, 92vw)", margin: "10% auto", background: "#1f1f1f", borderRadius: 8, color: "#fff", padding: "1.25rem 1.25rem 1rem" }}>
        <h3 style={{ marginTop: 0 }}>ACHAT — {symbol}</h3>
        <label style={{ display: "block", marginBottom: 8 }}>Montant en USD</label>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333", background: "#121212", color: "#fff" }}
          placeholder="Ex: 1000"
        />
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmer l’achat</button>
        </div>
      </div>
    </div>
  );
};

// ==== [BLOC: COMPOSANT PRINCIPAL] ===========================================
const CryptoList = () => {
  const {
    watchlist,
    currentPrices,
    priceChange5m,
    positionsMap,
    buyPosition,
    sellPosition,
  } = useContext(PortfolioContext);

  // --- États modales ---
  const [showBuy, setShowBuy] = useState(false);
  const [buySymbol, setBuySymbol] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const [showSell, setShowSell] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPercent, setSellPercent] = useState(100);

  // Adaptation des positions pour la SellModal (attend "quantity")
  const positionsForModal = useMemo(() => {
    const rows = [];
    for (const list of Object.values(positionsMap || {})) {
      for (const p of list) rows.push({ ...p, quantity: p.qty });
    }
    return rows;
  }, [positionsMap]);

  // --- Helpers UI ---
  const hasOpen = (sym) => !!(positionsMap && positionsMap[(sym || "").toUpperCase()]);
  const openBuy = (sym) => {
    setBuySymbol(sym.toUpperCase());
    setBuyAmount("");
    setShowBuy(true);
  };
  const confirmBuy = async () => {
    const amt = Number(buyAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    await buyPosition(buySymbol, amt); // achat en USD
    setShowBuy(false);
  };
  const openSell = (sym) => {
    setSellSymbol(sym.toUpperCase());
    setSellPercent(100);
    setShowSell(true);
  };
  const confirmSell = async () => {
    await sellPosition(sellSymbol, sellPercent);
    setShowSell(false);
  };

  // Tri simple par symbole
  const rows = useMemo(() => {
    const arr = (watchlist || []).map((s) => (s || "").toUpperCase()).filter(Boolean);
    arr.sort();
    return arr.map((sym) => ({
      symbol: sym,
      price: currentPrices[sym] ?? NaN,
      change5m: priceChange5m[sym],
    }));
  }, [watchlist, currentPrices, priceChange5m]);

  // Styles
  const wrap = { overflowX: "auto", borderRadius: 8, border: "1px solid #2a2a2a" };
  const table = { width: "100%", borderCollapse: "collapse", minWidth: 720, color: "#fff" };
  const th = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
  const td = { padding: "10px 12px", borderTop: "1px solid #2a2a2a" };

  return (
    <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
      <div style={wrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Crypto</th>
              <th style={th}>Prix (USD)</th>
              <th style={th}>Var 5m</th>
              <th style={th}></th>
              <th style={th}></th>
              <th style={th}>TD</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td style={td} colSpan={6}>&nbsp;Watchlist vide.</td></tr>
            ) : rows.map((r) => {
              const sym = r.symbol;
              const price = r.price;
              const chg = r.change5m;
              return (
                <tr key={sym}>
                  <td style={td}><b>{sym}</b></td>
                  <td style={td}>{fmtPrice(price)}</td>
                  <td style={{ ...td, color: typeof chg === "number" ? (chg >= 0 ? "lightgreen" : "salmon") : "#ddd" }}>
                    {typeof chg === "number" ? fmtPct(chg) : "—"}
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openBuy(sym)}
                        style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                      >
                        ACHAT
                      </button>
                      {hasOpen(sym) && (
                        <button
                          onClick={() => openSell(sym)}
                          style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                        >
                          VENTE
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={td}>
                    {hasOpen(sym) ? <span style={{ color: "#dc3545" }}>●</span> : <span style={{ color: "#888" }}>○</span>}
                  </td>
                  <td style={td}>
                    <a
                      href={`https://www.tradingview.com/symbols/${sym}USD`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#4ea8de", fontWeight: 700, textDecoration: "none" }}
                    >
                      →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==== [BLOC: MODALES] ============================================== */}
      <BuyModal
        show={showBuy}
        symbol={buySymbol}
        amount={buyAmount}
        onChangeAmount={setBuyAmount}
        onClose={() => setShowBuy(false)}
        onConfirm={confirmBuy}
      />

      <SellModal
        show={showSell}
        symbol={sellSymbol}
        price={currentPrices[(sellSymbol || "").toUpperCase()] ?? 0}
        percent={sellPercent}
        positions={positionsForModal}
        onClose={() => setShowSell(false)}
        onConfirm={confirmSell}
        onChangePercent={(e) => setSellPercent(Number(e.target.value))}
        onSetMax={() => setSellPercent(100)}
      />
    </div>
  );
};

export default CryptoList;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Bascule 100% Binance (affichage des prix depuis currentPrices).
// - ACHAT en USD (modale dédiée) + VENTE (SellModal) actives immédiatement via positionsMap.
// - Affichage watchlist unifiée avec variations 5 min (snapshot interne du contexte).
// - Tables scrollables, liens TradingView, indicateur ● si position ouverte.
// - Annotations de blocs pour modifications ciblées.