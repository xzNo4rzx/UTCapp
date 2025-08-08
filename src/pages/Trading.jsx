// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/pages/Trading.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { useEffect, useMemo, useState, useContext } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";

// ==== [BLOC: HELPERS UI] ====================================================
const fmtUSD = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(2)}`;
};
const fmtPct = (n) => (typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(2)}%` : "—");
const fmtPrice = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};

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

// ==== [BLOC: PAGE TRADING] ==================================================
const Trading = () => {
  const {
    portfolioName, cash, positions, currentPrices,
    buyPosition, sellPosition, updatePrices,
    investedAmount, totalProfit, totalProfitPercent,
    watchlist, priceChange5m, positionsMap, totalValue,
  } = useContext(PortfolioContext);

  // --- États modales ---
  const [showBuy, setShowBuy] = useState(false);
  const [buySymbol, setBuySymbol] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const [showSell, setShowSell] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPercent, setSellPercent] = useState(100);

  // Positions adaptées pour la SellModal (attend "quantity" au lieu de "qty")
  const positionsForModal = useMemo(
    () => positions.map((p) => ({ ...p, quantity: p.qty })),
    [positions]
  );

  // --- Tri top movers 5 min ---
  const movers = useMemo(() => {
    const rows = [];
    for (const sym of Object.keys(priceChange5m)) {
      rows.push({
        symbol: sym,
        change: priceChange5m[sym],
        price: currentPrices[sym] ?? NaN,
      });
    }
    rows.sort((a, b) => b.change - a.change);
    const topGainers = rows.slice(0, 5);
    const topLosers = rows.slice(-5).reverse();
    return { topGainers, topLosers };
  }, [priceChange5m, currentPrices]);

  // --- Achat ---
  const openBuy = (symbol) => {
    setBuySymbol(symbol.toUpperCase());
    setBuyAmount("");
    setShowBuy(true);
  };
  const confirmBuy = async () => {
    const amt = Number(buyAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    await buyPosition(buySymbol, amt);
    setShowBuy(false);
  };

  // --- Vente ---
  const openSell = (symbol) => {
    setSellSymbol(symbol.toUpperCase());
    setSellPercent(100);
    setShowSell(true);
  };
  const confirmSell = async () => {
    await sellPosition(sellSymbol, sellPercent);
    setShowSell(false);
  };

  // --- Mise à jour de départ + toutes les 60s (soft) ---
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      await updatePrices();
      if (!stop) timer = setTimeout(tick, 60 * 1000);
    };
    let timer = setTimeout(tick, 250);
    return () => { stop = true; clearTimeout(timer); };
  }, [updatePrices]);

  // --- Helpers d'affichage ---
  const hasOpenPosition = (sym) => !!positionsMap[(sym || "").toUpperCase()];
  const rowActionBtn = (sym) => {
    const symU = (sym || "").toUpperCase();
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => openBuy(symU)}
          style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}
        >
          ACHAT
        </button>
        {hasOpenPosition(symU) && (
          <button
            onClick={() => openSell(symU)}
            style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
          >
            VENTE
          </button>
        )}
      </div>
    );
  };

  // --- Table style ---
  const tableWrapStyle = { overflowX: "auto", borderRadius: 8, border: "1px solid #2a2a2a" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: 720, color: "#fff" };
  const thStyle = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
  const tdStyle = { padding: "10px 12px", borderTop: "1px solid #2a2a2a" };

  return (
    <div
      style={{
        backgroundImage: 'url("/backgrounds/homebackground.png")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "6rem 1rem 2rem",
        color: "#fff",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      {/* ==== [BLOC: EN-TÊTE & BILAN] ======================================= */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Trading — <span style={{ color: "#9ecbff" }}>{portfolioName}</span></h2>
        <button
          onClick={updatePrices}
          style={{ padding: "8px 12px", borderRadius: 6, background: "#0d6efd", border: "none", color: "#fff", cursor: "pointer" }}
        >
          UPDATE PRICES NOW
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 16 }}>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={{ color: "#999", fontSize: 12 }}>Solde total</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(totalValue)}</div>
        </div>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={{ color: "#999", fontSize: 12 }}>Cash disponible</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(cash)}</div>
        </div>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={{ color: "#999", fontSize: 12 }}>Investi (positions ouvertes)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(investedAmount)}</div>
        </div>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={{ color: "#999", fontSize: 12 }}>P&L global</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: totalProfit >= 0 ? "lightgreen" : "salmon" }}>
            {fmtUSD(totalProfit)} ({fmtPct(totalProfitPercent)})
          </div>
        </div>
      </div>

      {/* ==== [BLOC: TOP MOVERS 5 MIN] ===================================== */}
      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Top 5 — 5 min</h3>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          {/* Gainers */}
          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#7ee787" }}>Hausses</h4>
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Crypto</th>
                    <th style={thStyle}>Prix (USD)</th>
                    <th style={thStyle}>Var 5m</th>
                    <th style={thStyle}></th>
                    <th style={thStyle}></th>
                    <th style={thStyle}>TD</th>
                  </tr>
                </thead>
                <tbody>
                  {movers.topGainers.map((r) => {
                    const sym = r.symbol.toUpperCase();
                    const price = currentPrices[sym] ?? NaN;
                    return (
                      <tr key={`g_${sym}`}>
                        <td style={tdStyle}><b>{sym}</b></td>
                        <td style={tdStyle}>{fmtPrice(price)}</td>
                        <td style={{ ...tdStyle, color: r.change >= 0 ? "lightgreen" : "salmon" }}>{fmtPct(r.change)}</td>
                        <td style={tdStyle}>{rowActionBtn(sym)}</td>
                        <td style={tdStyle}>{hasOpenPosition(sym) ? <span style={{ color: "#dc3545" }}>●</span> : <span style={{ color: "#888" }}>○</span>}</td>
                        <td style={tdStyle}>
                          <a href={`https://www.tradingview.com/symbols/${sym}USD`} target="_blank" rel="noreferrer" style={{ color: "#4ea8de", fontWeight: 700, textDecoration: "none" }}>→</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Losers */}
          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#ff7b72" }}>Baisses</h4>
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Crypto</th>
                    <th style={thStyle}>Prix (USD)</th>
                    <th style={thStyle}>Var 5m</th>
                    <th style={thStyle}></th>
                    <th style={thStyle}></th>
                    <th style={thStyle}>TD</th>
                  </tr>
                </thead>
                <tbody>
                  {movers.topLosers.map((r) => {
                    const sym = r.symbol.toUpperCase();
                    const price = currentPrices[sym] ?? NaN;
                    return (
                      <tr key={`l_${sym}`}>
                        <td style={tdStyle}><b>{sym}</b></td>
                        <td style={tdStyle}>{fmtPrice(price)}</td>
                        <td style={{ ...tdStyle, color: r.change >= 0 ? "lightgreen" : "salmon" }}>{fmtPct(r.change)}</td>
                        <td style={tdStyle}>{rowActionBtn(sym)}</td>
                        <td style={tdStyle}>{hasOpenPosition(sym) ? <span style={{ color: "#dc3545" }}>●</span> : <span style={{ color: "#888" }}>○</span>}</td>
                        <td style={tdStyle}>
                          <a href={`https://www.tradingview.com/symbols/${sym}USD`} target="_blank" rel="noreferrer" style={{ color: "#4ea8de", fontWeight: 700, textDecoration: "none" }}>→</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ==== [BLOC: WATCHLIST] ============================================ */}
      <section style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Watchlist</h3>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Crypto</th>
                  <th style={thStyle}>Prix (USD)</th>
                  <th style={thStyle}>Var 5m</th>
                  <th style={thStyle}></th>
                  <th style={thStyle}></th>
                  <th style={thStyle}>TD</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((sym) => {
                  const s = (sym || "").toUpperCase();
                  const price = currentPrices[s] ?? NaN;
                  const chg = priceChange5m[s];
                  return (
                    <tr key={`w_${s}`}>
                      <td style={tdStyle}><b>{s}</b></td>
                      <td style={tdStyle}>{fmtPrice(price)}</td>
                      <td style={{ ...tdStyle, color: typeof chg === "number" ? (chg >= 0 ? "lightgreen" : "salmon") : "#ddd" }}>
                        {typeof chg === "number" ? fmtPct(chg) : "—"}
                      </td>
                      <td style={tdStyle}>{rowActionBtn(s)}</td>
                      <td style={tdStyle}>{hasOpenPosition(s) ? <span style={{ color: "#dc3545" }}>●</span> : <span style={{ color: "#888" }}>○</span>}</td>
                      <td style={tdStyle}>
                        <a href={`https://www.tradingview.com/symbols/${s}USD`} target="_blank" rel="noreferrer" style={{ color: "#4ea8de", fontWeight: 700, textDecoration: "none" }}>→</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#9aa0a6", marginTop: 8, fontSize: 13 }}>
            Astuce: le calcul des variations 5 minutes se base sur un snapshot interne actualisé automatiquement. Bouton <b>UPDATE PRICES NOW</b> pour rafraîchir immédiatement.
          </p>
        </div>
      </section>

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

export default Trading;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Intégration complète Top 5 hausses/baisses (5 min) directement dans Trading.jsx.
// - Bouton "ACHAT" => modale d’achat (montant en USD), cohérent avec buyPosition(symbol, usdAmount).
// - Bouton "VENTE" actif immédiatement si position ouverte (positionsMap), modale de vente existante utilisée.
// - Bouton "UPDATE PRICES NOW" + rafraîchissement auto toutes les 60s.
// - Tables scrollables horizontalement (overflowX:auto) pour éviter d’être tronquées.
// - Affichages robustes (prix/%) avec formatters, état visuel ● position ouverte.
// - Mappage pour SellModal (attend "quantity" → conversion depuis "qty").
// - Annotations de blocs ajoutées pour modifications ciblées.