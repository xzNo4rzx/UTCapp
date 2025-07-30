import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

const Admin = () => {
  const { user } = useAuth();
  const { refreshPending } = useAdmin();
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    crypto: "BTC/USD",
    type: "BUY",
    score: 1.0,
    risk: "🟢 Faible",
    explanation: "Signal manuel envoyé par l’admin."
  });

  if (user?.email !== "xzno4rzx@gmail.com") return <Navigate to="/" />;

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    } catch (err) {
      console.error("Erreur récupération utilisateurs :", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      fetchUsers();
      refreshPending();
    } catch (err) {
      console.error("Erreur mise à jour :", err);
    }
  };

  const sendManualSignal = async () => {
    setSending(true);
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        crypto: form.crypto,
        type: form.type,
        type_ia: "manual_push",
        score: Number(form.score),
        risk: form.risk,
        explanation: form.explanation.split("\n")
      };

      await fetch("https://utc-ai-signal-api.onrender.com/api/send-manual-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("✅ Signal envoyé !");
      setForm({ ...form, explanation: "Signal manuel envoyé par l’admin." });
    } catch (err) {
      console.error("❌ Erreur envoi signal :", err);
      alert("Erreur lors de l’envoi.");
    }
    setSending(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "2rem", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>🛠️ Tableau de bord Admin</h1>
      <p>Liste des utilisateurs en attente d’approbation ou actifs.</p>

      {/* Bloc validation des utilisateurs */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem", background: "#1e1e1e" }}>
        <thead>
          <tr style={{ background: "#333" }}>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Nom</th>
            <th style={{ padding: "8px" }}>Statut</th>
            <th style={{ padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? "#222" : "#2a2a2a" }}>
              <td style={{ padding: "8px" }}>{u.email}</td>
              <td style={{ padding: "8px" }}>{u.displayName || "—"}</td>
              <td style={{ padding: "8px", color: u.status === "accepted" ? "lightgreen" : u.status === "refused" ? "salmon" : "#ccc" }}>
                {u.status || "en attente"}
              </td>
              <td style={{ padding: "8px" }}>
                <button onClick={() => updateStatus(u.id, "accepted")} style={{ marginRight: "0.5rem", padding: "4px 8px" }}>
                  ✅ Valider
                </button>
                <button onClick={() => updateStatus(u.id, "refused")} style={{ padding: "4px 8px", background: "#a00", color: "#fff" }}>
                  ❌ Refuser
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bloc signal manuel */}
      <div style={{ marginTop: "3rem", padding: "1rem", background: "#1e1e1e", borderRadius: "8px" }}>
        <h2>📤 Envoyer un signal manuel</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <input
            value={form.crypto}
            onChange={(e) => setForm({ ...form, crypto: e.target.value })}
            placeholder="Crypto (ex: BTC/USD)"
            style={{ padding: "8px" }}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={{ padding: "8px" }}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
            <option value="CONTEXT">CONTEXT</option>
          </select>
          <input
            type="number"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            placeholder="Score IA"
            style={{ padding: "8px" }}
          />
          <select
            value={form.risk}
            onChange={(e) => setForm({ ...form, risk: e.target.value })}
            style={{ padding: "8px" }}
          >
            <option>🟢 Faible</option>
            <option>🟡 Moyen</option>
            <option>🔴 Élevé</option>
          </select>
          <textarea
            rows={4}
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            placeholder="Explication"
            style={{ padding: "8px" }}
          />
          <button
            onClick={sendManualSignal}
            disabled={sending}
            style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            🚀 Envoyer le signal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;