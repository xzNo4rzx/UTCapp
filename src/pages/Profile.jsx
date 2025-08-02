import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";

const Profile = () => {
  const {
    portfolioName,
    cash,
    positions,
    history,
    currentPrices,
    investedAmount,
    activePositionsCount,
    totalTrades,
    positiveTrades,
    totalProfit,
    totalProfitPercent,
    updatePrices,
    resetPortfolio,
    sellPosition,
  } = useContext(PortfolioContext);

  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);
  const [startDate, setStartDate] = useState(() => {
    const stored = localStorage.getItem("ptStartDate");
    return stored ? new Date(stored) : new Date();
  });

  const [variations, setVariations] = useState({});
  const [animatedSymbols, setAnimatedSymbols] = useState([]);

  useEffect(() => {
    localStorage.setItem("ptStartDate", startDate.toISOString());
  }, [startDate]);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        const resp = await axios.get("/utcapp/variations");
        setVariations(resp.data);
      } catch (err) {
        console.error("Erreur fetch variations :", err);
      }
    };
    fetchVariations();
  }, [positions]);

  const handleSell = (symbol, price) => {
    setSellSymbol(symbol);
    setSellPrice(price);
    setSellPercent(100);
    setSellModal(true);
  };

  const confirmSell = () => {
    const pos = positions.find((p) => p.symbol === sellSymbol);
    if (!pos) return;
    const qty = (sellPercent / 100) * pos.quantity;
    sellPosition(pos.id, qty, sellPrice);
    setSellModal(false);
  };

  const fmt = (n) => Number(n).toFixed(2);

  const handleUpdatePrices = () => {
    const btn = document.getElementById("update-btn");
    if (btn) {
      btn.classList.add("wizz");
      setTimeout(() => btn.classList.remove("wizz"), 400);
    }

    const previousPrices = {};
    positions.forEach((p) => {
      previousPrices[p.symbol] = currentPrices[p.symbol] ?? 0;
    });

    updatePrices();

    const newPrices = {};
    setTimeout(() => {
      const updated = [];
      positions.forEach((p) => {
        const oldP = previousPrices[p.symbol];
        const newP = currentPrices[p.symbol];
        if (newP !== undefined && oldP !== newP) {
          updated.push(p.symbol);
        }
      });
      setAnimatedSymbols(updated);
      setTimeout(() => setAnimatedSymbols([]), 600);
    }, 200);
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/backgrounds/homebackground.png")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "6rem 2rem 2rem",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      {/* 🔒 Titre + Bilan sticky */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.6)", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h1>👤 Mon Portefeuille</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ color: "#aaa" }}>
            {portfolioName} | 🕒 Début du PT : {startDate.toLocaleString()}
          </h2>
          <button
            onClick={() => {
              if (window.confirm("Confirmer la remise à zéro ?")) {
                localStorage.removeItem("ptStartDate");
                resetPortfolio();
              }
            }}
            style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            🧨 RESET PT TO 10000$
          </button>
        </div>

        <section style={{ marginTop: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>📊 Bilan</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            <div>💼 Solde total : ${fmt(cash + investedAmount)}</div>
            <div>💰 Cash disponible : ${fmt(cash)}</div>
            <div>📈 Investi : ${fmt(investedAmount)}</div>
            <div>📊 Positions ouvertes : {activePositionsCount}</div>
            <div>🔁 Nombre de trades : {totalTrades}</div>
            <div>✅ Trades positifs : {positiveTrades} / {totalTrades}</div>
            <div style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#222",
              borderRadius: "6px",
              color: totalProfit >= 0 ? "lightgreen" : "salmon",
              marginLeft: "auto"
            }}>
              📈 Rendement total : ${fmt(totalProfit)} ({fmt(totalProfitPercent)}%)
            </div>
            <button
              id="update-btn"
              onClick={handleUpdatePrices}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              🔄 UPDATE PRICES NOW
            </button>
          </div>
        </section>
      </div>

      {/* 🔄 Positions en cours */}
      <section>
        <h3>📌 Positions en cours</h3>
        {positions.length === 0 ? (
          <p>Aucune position ouverte.</p>
        ) : (
          positions.map((p) => {
            const curr = currentPrices[p.symbol] ?? 0;
            const inv = p.quantity * p.buyPrice;
            const valueNow = p.quantity * curr;
            const pnl = valueNow - inv;
            const pnlPct = ((valueNow / inv) - 1) * 100;
            const v = variations[p.symbol] || {};
            const changeLine = `${(v["5m"] ?? 0).toFixed(2)}% (5m) | ${(v["1d"] ?? 0).toFixed(2)}% (1j) | ${(v["7d"] ?? 0).toFixed(2)}% (7j)`;

            return (
              <div key={p.id} style={{
                borderLeft: `6px solid ${pnl >= 0 ? "#0f0" : "#f00"}`,
                backgroundColor: "rgba(30,30,30,0.6)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{p.symbol}</div>
                  <div
                    className={animatedSymbols.includes(p.symbol) ? "wizz" : ""}
                    style={{ color: curr >= p.buyPrice ? "lightgreen" : "salmon" }}
                  >
                    ${fmt(curr)}
                  </div>
                  <div style={{ color: pnl >= 0 ? "lightgreen" : "salmon" }}>
                    {fmt(pnl)}$ / {fmt(pnlPct)}%
                  </div>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                  🕒 {new Date(p.date).toLocaleString()} | ID : {p.id} | Investi : ${fmt(inv)} | Achat : ${fmt(p.buyPrice)}
                </div>
                
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={() => handleSell(p.symbol, curr)}
                    style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    VENDRE
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* 🕓 Historique scrollable */}
      <section style={{ marginTop: "2rem", maxHeight: "400px", overflowY: "auto" }}>
        <h3>🕓 Historique</h3>
        {history.length === 0 ? (
          <p>Aucun trade enregistré.</p>
        ) : (
          history.map((t) => {
            const profitPct = t.type === "sell"
              ? ((t.profit / (t.buyPrice * t.quantity)) * 100)
              : null;
            return (
              <div key={t.id} style={{
                borderLeft: `6px solid ${t.type === "sell" ? (t.profit >= 0 ? "#0f0" : "#f00") : "#888"}`,
                backgroundColor: "rgba(30,30,30,0.6)",
                backdropFilter: "blur(8px)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: "bold" }}>{t.symbol}</div>
                  <div style={{ color: "#ccc" }}>{t.type.toUpperCase()}</div>
                  <div style={{ color: t.type === "sell" ? (t.profit >= 0 ? "lightgreen" : "salmon") : "#ccc" }}>
                    {t.type === "sell"
                      ? `$${fmt(t.profit)} (${fmt(profitPct)}%)`
                      : "—"}
                  </div>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#ccc" }}>
                  🕒 {new Date(t.date).toLocaleString()} | ID : {t.id} | Investi : ${fmt(t.quantity * t.buyPrice)} | Achat : ${fmt(t.buyPrice)} | Vente : {t.type === "sell" ? `$${fmt(t.sellPrice)}` : "—"}
                </div>
              </div>
            );
          })
        )}
      </section>

      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={sellPrice}
        percent={sellPercent}
        positions={positions}
        onChangePercent={(e) => setSellPercent(Number(e.target.value))}
        onSetMax={() => setSellPercent(100)}
        onClose={() => setSellModal(false)}
        onConfirm={confirmSell}
      />

      <style>{`
        @keyframes wizz {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .wizz {
          animation: wizz 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;