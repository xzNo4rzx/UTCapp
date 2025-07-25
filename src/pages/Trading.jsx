import React, { useContext, useEffect, useMemo, useState } from "react";
import fetchPrices from "../utils/fetchPrices";
import { PortfolioContext } from "../context/PortfolioContext";
import TopMovers from "../components/TopMovers";
import CryptoList from "../components/CryptoList";
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
  const [top5Up, setTop5Up] = useState([]);
  const [top5Down, setTop5Down] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [sellModal, setSellModal] = useState(false);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellPercent, setSellPercent] = useState(100);

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
    const quantity = amount / price;
    buyPosition(symbol, quantity, price);
  };

  const handleUpdatePrices = async () => {
    try {
      const { top5Up, top5Down, rest } = await fetchPrices();
      const now = new Date().toLocaleTimeString();
      setTop5Up(top5Up);
      setTop5Down(top5Down);

      const merged = [...top5Up, ...top5Down, ...rest];
      const unique = Array.from(new Map(merged.map(c => [c.symbol, c])).values());
      setCryptos(unique);

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

  return (
    <div style={{ padding: "2rem", backgroundColor: "#121212", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif" }}>
      <h1>💸 TradingVirtuel</h1>
      <h2 style={{ marginTop: "-1rem", color: "#aaa" }}>
        {portfolioName} | 🕒 Début : {startDate ? new Date(startDate).toLocaleString() : "—"}
      </h2>

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

      <div style={{ margin: "2rem 0" }}>
        <button
          onClick={handleUpdatePrices}
          style={{
            marginRight: "1rem",
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            animation: "shake 0.4s",
          }}
        >
          🔄 UPDATE PRICES NOW
        </button>
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            50% { transform: translateX(2px); }
            75% { transform: translateX(-2px); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>

      {lastUpdate && (
        <div style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#888" }}>
          Dernière mise à jour : {lastUpdate}
        </div>
      )}

      <TopMovers title="📈 Top 5 hausses" data={top5Up} positions={positions} onBuy={handleBuy} onOpenSell={openSell} headerAlign="left" />
      <TopMovers title="📉 Top 5 baisses" data={top5Down} positions={positions} onBuy={handleBuy} onOpenSell={openSell} headerAlign="left" />
      <CryptoList cryptos={sortedCryptos} positions={positions} onBuy={handleBuy} onOpenSell={openSell} headerAlign="left" />

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
    </div>
  );
};

export default Trading;