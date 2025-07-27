// src/pages/Trading.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import fetchPrices from "../utils/fetchPrices";
import { PortfolioContext } from "../context/PortfolioContext";
import SellModal from "../components/SellModal";


const Trading = () => {
  const {
    portfolioName,
    cash,
    positions,
    currentPrices,
    buyPosition,
    sellPosition,
    updatePrices,
    investedAmount,
    totalProfit,
    totalProfitPercent,
  } = useContext(PortfolioContext);

  const [cryptos, setCryptos] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);
  const [top5Up, setTop5Up] = useState([]);
  const [top5Down, setTop5Down] = useState([]);
  const [updatedPrices, setUpdatedPrices] = useState({}); // animations

  const openSell = (symbol, price) => {
    setSellSymbol(symbol);
    setSellPrice(price);
    setSellPercent(100);
    setSellModal(true);
  };

  const confirmSell = () => {
    const pos = positions?.find((p) => p.symbol === sellSymbol);
    if (!pos) return;
    const quantityToSell = (sellPercent / 100) * pos.quantity;
    sellPosition(pos.id, quantityToSell, sellPrice);
    setSellModal(false);
  };

  const handleBuy = (symbol, price) => {
    const input = window.prompt(`Montant en USD à investir dans ${symbol} :`, "100");
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      alert("Montant invalide");
      return;
    }
    if (amount > cash) {
      alert("Fonds insuffisants !");
      return;
    }
    if (window.confirm(`Confirmer achat de ${symbol} pour $${amount.toFixed(2)} (valeur actuelle : $${price.toFixed(2)}) ?`)) {
      const quantity = amount / price;
      buyPosition(symbol, quantity, price);
    }
  };

  const handleUpdatePrices = async () => {
    const updateBtn = document.getElementById("update-btn");
    if (updateBtn) {
      updateBtn.classList.add("shake");
      setTimeout(() => updateBtn.classList.remove("shake"), 500);
    }

    try {
      const { top5Up, top5Down, rest } = await fetchPrices();
      const now = new Date().toLocaleTimeString();
      const merged = [...top5Up, ...top5Down, ...rest];
      const unique = Array.from(new Map(merged.map(c => [c.symbol, c])).values());

      // détecter changements
      const changed = {};
      unique.forEach((c) => {
        const prev = cryptos.find((p) => p.symbol === c.symbol);
        if (prev && prev.currentPrice !== c.currentPrice) {
          changed[c.symbol] = true;
        }
      });
      setUpdatedPrices(changed);

      setCryptos(unique);
      setTop5Up(top5Up);
      setTop5Down(top5Down);
      setLastUpdate(now);
      updatePrices();
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
    }
  };

  useEffect(() => {
    handleUpdatePrices();
    const interval = setInterval(handleUpdatePrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const knownOrder = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOGE", "MATIC", "DOT"];
  const sortedCryptos = useMemo(() => {
    return [...cryptos].sort((a, b) => {
      const ia = knownOrder.indexOf(a.symbol);
      const ib = knownOrder.indexOf(b.symbol);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [cryptos]);

  const positionSummary = useMemo(() => {
    const total = (positions ?? []).reduce((sum, p) => {
      const curr = currentPrices?.[p.symbol] ?? 0;
      return sum + p.quantity * curr;
    }, 0);
    return {
      count: positions?.length ?? 0,
      value: total,
    };
  }, [positions, currentPrices]);

  const handleChangePercent = (e) => setSellPercent(Number(e.target.value));
  const handleSetMax = () => setSellPercent(100);
  const handleCloseSell = () => setSellModal(false);

  const startDate = localStorage.getItem("ptStartDate");

  const renderCryptoBlock = (c) => {
    const hasPosition = positions?.some((p) => p.symbol === c.symbol && p.quantity > 0);
    const priceColor = c.changePercent >= 0 ? "lightgreen" : "salmon";
    const animate = updatedPrices[c.symbol];

    return (
      <div key={c.symbol} style={{
        borderLeft: `6px solid ${c.changePercent >= 0 ? "#0f0" : "#f00"}`,
        backgroundColor: "#1e1e1e",
        borderRadius: "8px",
        padding: "1rem",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{c.symbol}</div>
          <div className={animate ? "animate-price" : ""} style={{ color: "#ccc", fontSize: "1rem" }}>
            ${c.currentPrice?.toFixed(4)}
          </div>
          <div style={{ color: priceColor, fontSize: "1rem" }}>{c.changePercent.toFixed(2)}%</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <button
            onClick={() => handleBuy(c.symbol, c.currentPrice)}
            style={{ padding: "6px 12px", backgroundColor: "#4ea8de", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            ACHAT
          </button>
          <button
            onClick={() => openSell(c.symbol, c.currentPrice)}
            disabled={!hasPosition}
            style={{
              backgroundColor: hasPosition ? "#dc3545" : "#555",
              color: "#fff",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
            }}
          >
            VENTE
          </button>
          <a
            href={`https://www.tradingview.com/symbols/${c.symbol}USD`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#4ea8de", fontWeight: "bold", textDecoration: "none", alignSelf: "center" }}
          >
            → TradingView
          </a>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif" }}>
      <h1>💸 TradingVirtuel</h1>
      <h2 style={{ marginTop: "-1rem", color: "#aaa" }}>
        {portfolioName} | 🕒 Début : {startDate ? new Date(startDate).toLocaleString() : "—"}
      </h2>

      {/* Bilan */}
      <div style={{ marginTop: "1rem" }}>
        <div>💼 Solde total : ${(cash + investedAmount).toFixed(2)}</div>
        <div>💰 Cash disponible : ${cash.toFixed(2)}</div>
        <div>📈 Investi : ${investedAmount.toFixed(2)}</div>
        <div style={{ color: totalProfit >= 0 ? "lightgreen" : "salmon" }}>
          📊 Rendement total : ${totalProfit.toFixed(2)} ({totalProfitPercent.toFixed(2)}%)
        </div>
        <div style={{ marginTop: "1rem" }}>
          📌 Positions placées : {positionSummary.count} | Valeur actuelle : ${positionSummary.value.toFixed(2)}
        </div>
      </div>

      {/* Update Button */}
      <div style={{ margin: "2rem 0" }}>
        <button
          id="update-btn"
          onClick={handleUpdatePrices}
          style={{
            marginRight: "1rem",
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          🔄 UPDATE PRICES NOW
        </button>
      </div>

      {lastUpdate && (
        <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#888" }}>
          Dernière mise à jour : {lastUpdate}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <h3>📈 Top 5 hausses</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {top5Up.map(renderCryptoBlock)}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3>📉 Top 5 baisses</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {top5Down.map(renderCryptoBlock)}
        </div>
      </div>

      <h3>🧾 Autres cryptos</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sortedCryptos.map(renderCryptoBlock)}
      </div>

      <SellModal
        show={sellModal}
        symbol={sellSymbol}
        price={sellPrice}
        percent={sellPercent}
        positions={positions}
        onChangePercent={handleChangePercent}
        onSetMax={handleSetMax}
        onClose={handleCloseSell}
        onConfirm={confirmSell}
      />

      {/* Animation styles */}
      <style>{`
        .shake {
          animation: shake 0.4s;
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }

        .animate-price {
          animation: popPrice 0.4s ease-in-out;
        }

        @keyframes popPrice {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Trading;