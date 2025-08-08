// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/pages/Profile.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { useEffect, useMemo, useState, useContext } from "react";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";

// ==== [BLOC: HELPERS] =======================================================
const fmtUSD = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${n.toFixed(2)}`;
};
const fmtPct = (n) => (typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(2)}%` : "—");
const fmtPrice = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};
const safe = (v, fb = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fb);

// ==== [BLOC: COMPOSANT] =====================================================
const Profile = () => {
  const {
    portfolioName, cash, positions, history, currentPrices,
    investedAmount, activePositionsCount, totalTrades, positiveTrades,
    totalProfit, totalProfitPercent, updatePrices, resetPortfolio, sellPosition, totalValue,
  } = useContext(PortfolioContext);

  // ---- Début du PT (persisté localement) -----------------------------------
  const [ptStart, setPtStart] = useState(() => {
    const stored = localStorage.getItem("pt_start");
    if (stored) return stored;
    const now = new Date().toISOString();
    localStorage.setItem("pt_start", now);
    return now;
  });

  // ---- Sell modal state -----------------------------------------------------
  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPercent, setSellPercent] = useState(100);

  // Adaptation des positions pour la SellModal (attend "quantity")
  const positionsForModal = useMemo(
    () => positions.map((p) => ({ ...p, quantity: p.qty })),
    [positions]
  );

  // ---- Bouton Update Prices Now --------------------------------------------
  const onUpdatePrices = async () => {
    await updatePrices();
  };

  // ---- RESET PT (remet cash à 10k, garde l'historique) ---------------------
  const onResetPT = () => {
    resetPortfolio();
    const now = new Date().toISOString();
    localStorage.setItem("pt_start", now);
    setPtStart(now);
  };

  // ---- Ouvrir / Confirmer vente -------------------------------------------
  const openSell = (symbol) => {
    setSellSymbol(symbol.toUpperCase());
    setSellPercent(100);
    setSellModal(true);
  };
  const confirmSell = async () => {
    await sellPosition(sellSymbol, sellPercent);
    setSellModal(false);
  };

  // ---- Table style ----------------------------------------------------------
  const wrap = { overflowX: "auto", border: "1px solid #2a2a2a", borderRadius: 8 };
  const table = { width: "100%", minWidth: 980, borderCollapse: "collapse", color: "#fff" };
  const th = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
  const td = { padding: "10px 12px", borderTop: "1px solid #2a2a2a", verticalAlign: "middle" };

  // ---- Dérivés pour affichage ----------------------------------------------
  const enrichedPositions = useMemo(() => {
    return positions.map((p) => {
      const sym = (p.symbol || "").toUpperCase();
      const cur = currentPrices[sym];
      const curPrice = typeof cur === "number" ? cur : p.buyPrice;
      const investedUSD = safe(p.qty, 0) * safe(p.buyPrice, 0);
      const resultUSD = safe(p.qty, 0) * (safe(curPrice, 0) - safe(p.buyPrice, 0));
      const resultPct = safe(p.buyPrice, 0) > 0 ? (safe(curPrice, 0) - p.buyPrice) / p.buyPrice * 100 : 0;
      return {
        ...p,
        sym,
        curPrice,
        investedUSD,
        resultUSD,
        resultPct,
      };
    });
  }, [positions, currentPrices]);

  return (
    <div
      style={{
        backgroundImage: 'url("/backgrounds/homebackground.png")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "6rem 1rem 2rem",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        color: "#fff"
      }}
    >
      {/* ==== [BLOC: Titre + Début du PT + Reset] ========================== */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>
          Profile — <span style={{ color: "#9ecbff" }}>{portfolioName}</span>
        </h2>
        <div style={{ color: "#9aa0a6" }}>
          <b>Début du PT:</b> {new Date(ptStart).toLocaleString()}
        </div>
        <button
          onClick={onResetPT}
          style={{ padding: "8px 12px", borderRadius: 6, background: "#6c757d", border: "none", color: "#fff", cursor: "pointer" }}
        >
          RESET PT TO 10000$
        </button>
      </div>

      {/* ==== [BLOC: ENCARt BILAN] ========================================= */}
      <section style={{ marginTop: 6 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Bilan</h3>
          <button
            onClick={onUpdatePrices}
            style={{ padding: "8px 12px", borderRadius: 6, background: "#0d6efd", border: "none", color: "#fff", cursor: "pointer" }}
          >
            UPDATE PRICES NOW
          </button>
        </div>

        {/* Ordre EXACT demandé */}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Solde total (cash + investissement valorisé)</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(totalValue)}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Cash disponible</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(cash)}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Investi</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fmtUSD(investedAmount)}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Nombre de positions ouvertes</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{activePositionsCount}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Nombre de trades</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{totalTrades}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Nombre de trades positifs</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{positiveTrades}</div>
          </div>

          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: 12 }}>Rendement total</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: totalProfit >= 0 ? "lightgreen" : "salmon" }}>
              {fmtUSD(totalProfit)} ({fmtPct(totalProfitPercent)})
            </div>
          </div>
        </div>
      </section>

      {/* ==== [BLOC: POSITIONS EN COURS] =================================== */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Positions en cours</h3>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={wrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Crypto</th>
                  <th style={th}>Date & heure d'achat</th>
                  <th style={th}>ID du placement</th>
                  <th style={th}>Montant investi ($)</th>
                  <th style={th}>Prix d'achat</th>
                  <th style={th}>Prix actuel</th>
                  <th style={th}>Résultat</th>
                  <th style={th}>Vente</th>
                </tr>
              </thead>
              <tbody>
                {enrichedPositions.length === 0 ? (
                  <tr><td style={td} colSpan={8}>&nbsp;Aucune position ouverte.</td></tr>
                ) : enrichedPositions.map((p) => {
                  const colorNow = p.curPrice >= p.buyPrice ? "lightgreen" : "salmon";
                  const resColor = p.resultUSD >= 0 ? "lightgreen" : "salmon";
                  return (
                    <tr key={p.id}>
                      <td style={td}><b>{p.sym}</b></td>
                      <td style={td}>{new Date(p.buyAt).toLocaleString()}</td>
                      <td style={td} title={p.id}>{p.id}</td>
                      <td style={td}>{fmtUSD(p.investedUSD)}</td>
                      <td style={td}>{fmtPrice(p.buyPrice)}</td>
                      <td style={{ ...td, color: colorNow }}>{fmtPrice(p.curPrice)}</td>
                      <td style={{ ...td, color: resColor }}>
                        {fmtPct(p.resultPct)} &nbsp; {fmtUSD(p.resultUSD)}
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => openSell(p.sym)}
                          style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                        >
                          VENTE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#9aa0a6", marginTop: 8, fontSize: 13 }}>
            Utilisez <b>UPDATE PRICES NOW</b> pour rafraîchir les prix et éviter tout affichage obsolète.
          </p>
        </div>
      </section>

      {/* ==== [BLOC: HISTORIQUE] =========================================== */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Historique</h3>
        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
          <div style={{ ...wrap, maxHeight: 420 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>ID du placement</th>
                  <th style={th}>Date & heure</th>
                  <th style={th}>Crypto</th>
                  <th style={th}>Type</th>
                  <th style={th}>Investissement ($)</th>
                  <th style={th}>Prix d'achat</th>
                  <th style={th}>Prix de vente</th>
                  <th style={th}>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td style={td} colSpan={8}>&nbsp;Aucun historique pour le moment.</td></tr>
                ) : history.map((h) => {
                  const sym = (h.symbol || "").toUpperCase();
                  const isSell = h.type === "SELL";
                  const invested = h.type === "BUY" ? safe(h.qty, 0) * safe(h.price, 0)
                                 : (typeof h.buyPrice === "number" && typeof h.qty === "number" ? h.qty * h.buyPrice : 0);
                  const pnlUSD = isSell ? (typeof h.pnlUSD === "number" ? h.pnlUSD : (safe(h.price,0) - safe(h.buyPrice,0)) * safe(h.qty,0)) : 0;
                  const pnlPct = isSell
                    ? (safe(h.buyPrice,0) > 0 ? ((safe(h.price,0) - safe(h.buyPrice,0)) / safe(h.buyPrice,0)) * 100 : 0)
                    : 0;
                  const resColor = pnlUSD >= 0 ? "lightgreen" : "salmon";

                  return (
                    <tr key={h.id}>
                      <td style={td} title={h.id}>{h.id}</td>
                      <td style={td}>{new Date(h.at).toLocaleString()}</td>
                      <td style={td}><b>{sym}</b></td>
                      <td style={td}>{h.type}</td>
                      <td style={td}>{fmtUSD(invested)}</td>
                      <td style={td}>
                        {typeof h.buyPrice === "number" ? fmtPrice(h.buyPrice) : "—"}
                      </td>
                      <td style={td}>
                        {isSell ? fmtPrice(h.price) : "—"}
                      </td>
                      <td style={{ ...td, color: resColor }}>
                        {isSell ? `${fmtPct(pnlPct)}  ${fmtUSD(pnlUSD)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==== [BLOC: MODALE VENTE] ========================================= */}
      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={currentPrices[(sellSymbol || "").toUpperCase()] ?? 0}
        percent={sellPercent}
        positions={positionsForModal}
        onClose={() => setSellModal(false)}
        onConfirm={confirmSell}
        onChangePercent={(e) => setSellPercent(Number(e.target.value))}
        onSetMax={() => setSellPercent(100)}
      />
    </div>
  );
};

export default Profile;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Ajout du "Début du PT" (persisté localStorage) + bouton "RESET PT TO 10000$" juste à côté.
// - Encart "Bilan" avec ordre exact demandé + bouton "UPDATE PRICES NOW" à côté du titre.
// - Tableau "Positions en cours" complet: Crypto, Date/heure d’achat, ID, Montant investi, Prix d’achat, Prix actuel (coloré), Résultat % et $, Bouton vente.
// - Historique scrollable (colonnes: ID, date/heure, crypto, type, investissement $, prix d’achat, prix de vente, résultat % et $).
// - Boutons "VENTE" actifs via SellModal, avec slider % et bouton MAX (gérés par SellModal).
// - Tables avec overflow horizontal pour éviter les coupes + formats robustes (USD, %, prix).
// - Aucun appel CryptoCompare: affichage basé sur currentPrices (alimentés par Binance via PortfolioContext).