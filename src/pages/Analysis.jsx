// src/pages/Analysis.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Correspondance période → paramètres API
const periodToApi = {
  "1h": { limit: 60, aggregate: 1, unit: "minute" },
  "1d": { limit: 24, aggregate: 1, unit: "hour" },
  "7d": { limit: 7, aggregate: 1, unit: "day" },
  "1m": { limit: 30, aggregate: 1, unit: "day" },
  "6m": { limit: 180, aggregate: 1, unit: "day" },
};

// Liste des cryptos disponibles
const SYMBOLS = ["BTC", "ETH", "SOL", "ADA", "MATIC"];

const Analysis = () => {
  const [symbol, setSymbol] = useState("BTC");
  const [period, setPeriod] = useState("1h");
  const [dataPoints, setDataPoints] = useState([]);
  const [commentary, setCommentary] = useState("");

  // 1) Chargement des données historiques
  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const params = periodToApi[period];
        if (!params) throw new Error(`Période inconnue : ${period}`);

        const resp = await axios.get(
          `https://min-api.cryptocompare.com/data/v2/histo${params.unit}`,
          { params: { fsym: symbol, tsym: "USD", ...params } }
        );
        const raw = resp.data.Data.Data;
        const points = raw.map(p => ({ time: p.time * 1000, close: p.close }));
        setDataPoints(points);

        // 2) Génération du commentaire IA
        if (points.length > 1) {
          const first = points[0].close;
          const last  = points[points.length - 1].close;
          const change = ((last - first) / first) * 100;
          setCommentary(
            `Sur la période ${period}, ${symbol} a ${change >= 0 ? "gagné" : "perdu"} ${Math.abs(change).toFixed(2)}%.`
          );
        } else {
          setCommentary("");
        }
      } catch (err) {
        console.error("Erreur fetch historique :", err.message);
        setDataPoints([]);
        setCommentary("");
      }
    };

    fetchHistorical();
  }, [symbol, period]);

  // 3) Calcul des signaux (croisement de moyennes mobiles 5/20)
  const signals = useMemo(() => {
    const shortW = 5, longW = 20;
    if (dataPoints.length < longW) return [];

    const closes = dataPoints.map(p => p.close);
    const sma = (arr, w) => arr.map((_, i) =>
      i < w - 1 ? null : arr.slice(i - w + 1, i + 1).reduce((a, b) => a + b, 0) / w
    );

    const sma5  = sma(closes, shortW);
    const sma20 = sma(closes, longW);
    const sigs = [];

    for (let i = 1; i < dataPoints.length; i++) {
      if (sma5[i - 1] != null && sma20[i - 1] != null) {
        if (sma5[i] > sma20[i] && sma5[i - 1] <= sma20[i - 1])
          sigs.push({ time: dataPoints[i].time, type: "buy" });
        if (sma5[i] < sma20[i] && sma5[i - 1] >= sma20[i - 1])
          sigs.push({ time: dataPoints[i].time, type: "sell" });
      }
    }
    return sigs;
  }, [dataPoints]);

  // 4) Préparation des données Chart.js
  const chartData = useMemo(() => ({
    datasets: [
      {
        label: `${symbol} prix`,
        data: dataPoints.map(p => ({ x: p.time, y: p.close })),
        borderColor: "#eee",
        pointRadius: 0,
      },
      {
        label: "Signaux achat",
        data: signals.filter(s => s.type === "buy").map(s => ({ x: s.time, y: null })),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        showLine: false,
        pointStyle: "triangle",
        pointRadius: 8,
      },
      {
        label: "Signaux vente",
        data: signals.filter(s => s.type === "sell").map(s => ({ x: s.time, y: null })),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        showLine: false,
        pointStyle: "rectRot",
        pointRadius: 8,
      },
    ],
  }), [symbol, dataPoints, signals]);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        grid: { color: "#333" },
        ticks: { color: "#ccc" },
      },
      y: {
        grid: { color: "#333" },
        ticks: { color: "#ccc" },
      },
    },
    plugins: {
      legend: { labels: { color: "#ccc" } },
      tooltip: { bodyColor: "#000", backgroundColor: "#fff" },
    },
  };

  return (
    <div style={{ padding: "2rem", background: "#111", minHeight: "100vh", color: "#eee", fontFamily: "sans-serif" }}>
      <h1>📊 Analyse {symbol}/USD — {period}</h1>

      {/* Sélecteurs */}
      <div style={{ marginBottom: "1rem" }}>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "1rem", background: "#222", color: "#eee", border: "1px solid #444" }}
        >
          {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {["1h","1d","7d","1m","6m"].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              background: p === period ? "#10b981" : "#222",
              color: p === period ? "#000" : "#ccc",
              border: "1px solid #444",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Graphique */}
      <div style={{ padding: "1rem", background: "#1f2937", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Légende */}
      <div style={{ marginTop: "1.5rem", color: "#ccc" }}>
        <strong>Légende :</strong>
        <ul style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>
          <li><span style={{ color: "#10b981" }}>▲</span> : signal d’achat</li>
          <li><span style={{ color: "#ef4444" }}>◆</span> : signal de vente</li>
        </ul>
      </div>

      {/* Commentaire IA */}
      {commentary && (
        <p style={{ marginTop: "1rem", color: "#aaa" }}>
          {commentary}
        </p>
      )}
    </div>
  );
};

export default Analysis;