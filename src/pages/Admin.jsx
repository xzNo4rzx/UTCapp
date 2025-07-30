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
  const [adminMessage, setAdminMessage] = useState("");

  if (user?.email !== "xzno4rzx@gmail.com") return <Navigate to="/" />;

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const sendAdminMessage = async () => {
    if (!adminMessage.trim()) {
      alert("Merci de saisir un message.");
      return;
    }
    setSending(true);
    try {
      await fetch("https://utc-ai-signal-api.onrender.com/api/send-manual-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          crypto: "ADMIN",
          type: "ADMIN_POST",
          type_ia: "admin_post",
          score: 0,
          risk: "🔔 Info",
          explanation: [`ADMIN POST: ${adminMessage.trim()}`],
        }),
      });
      alert("✅ Message envoyé !");
      setAdminMessage("");
    } catch (err) {
      console.error("❌ Erreur envoi message admin :", err);
      alert("Erreur lors de l’envoi.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "2rem", background: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>🛠️ Tableau de bord Admin</h1>

      {/* Utilisateurs */}
      <table style={{ width: "100%", marginTop: "2rem", background: "#1e1e1e", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#333" }}>
          <th style={{ padding: 8 }}>Email</th>
          <th style={{ padding: 8 }}>Nom</th>
          <th style={{ padding: 8 }}>Statut</th>
          <th style={{ padding: 8 }}>Action</th>
        </tr></thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} style={{ background: i % 2 === 0 ? "#222" : "#2a2a2a" }}>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.displayName || "—"}</td>
              <td style={{
                padding: 8,
                color: u.status === "accepted" ? "lightgreen" : u.status === "refused" ? "salmon" : "#ccc"
              }}>
                {u.status || "en attente"}
              </td>
              <td style={{ padding: 8 }}>
                <button onClick={() => updateStatus(u.id, "accepted")} style={{ marginRight: 8 }}>✅</button>
                <button onClick={() => updateStatus(u.id, "refused")} style={{ background: "#a00", color: "#fff" }}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Message Admin */}
      <div style={{ marginTop: "3rem", padding: "1rem", background: "#1e1e1e", borderRadius: 8 }}>
        <h2>📨 Envoyer un message admin</h2>
        <textarea
          rows={4}
          value={adminMessage}
          onChange={e => setAdminMessage(e.target.value)}
          placeholder="Votre message ici…"
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
        <button
          onClick={sendAdminMessage}
          disabled={sending}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          {sending ? "Envoi…" : "🚀 Envoyer"}
        </button>
      </div>
    </div>
  );
};

export default Admin;