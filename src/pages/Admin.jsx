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

  // Redirige si pas admin
  if (user?.email !== "xzno4rzx@gmail.com") return <Navigate to="/" />;

  // Récupère la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erreur récupération utilisateurs :", err);
    }
  };

  // Valide ou refuse un utilisateur
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      fetchUsers();
      refreshPending();
    } catch (err) {
      console.error("Erreur mise à jour :", err);
    }
  };

  // Envoie un message libre sur Telegram + journalise
  const sendAdminMessage = async () => {
    if (!adminMessage.trim()) {
      alert("Veuillez saisir un message.");
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
          explanation: [
            `ADMIN POST: ${adminMessage.trim()}`
          ]
        }),
      });
      alert("✅ Message envoyé !");
      setAdminMessage("");
    } catch (err) {
      console.error("❌ Erreur envoi message admin :", err);
      alert("Erreur lors de l’envoi du message.");
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
      <p>Liste des utilisateurs en attente d’approbation ou actifs.</p>

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
              <td style={{
                padding: "8px",
                color: u.status === "accepted" ? "lightgreen" :
                       u.status === "refused"  ? "salmon" : "#ccc"
              }}>
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

      <div style={{ marginTop: "3rem", padding: "1rem", background: "#1e1e1e", borderRadius: "8px" }}>
        <h2>📨 Envoyer un message admin</h2>
        <textarea
          rows={4}
          value={adminMessage}
          onChange={(e) => setAdminMessage(e.target.value)}
          placeholder="Votre message..."
          style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
        />
        <button
          onClick={sendAdminMessage}
          disabled={sending || !adminMessage.trim()}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {sending ? "Envoi..." : "🚀 Envoyer le message"}
        </button>
      </div>
    </div>
  );
};

export default Admin;