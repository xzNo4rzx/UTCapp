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
  const [formMessage, setFormMessage] = useState("");

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

  const sendAdminPost = async () => {
    if (!formMessage.trim()) return alert("Message vide");
    try {
      await fetch("https://utc-ai-signal-api.onrender.com/api/send-manual-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          crypto: "ADMIN",
          type: "CONTEXT",
          type_ia: "admin_post",
          score: 0,
          risk: "🔵 Informatif",
          explanation: [`ADMIN POST : ${formMessage}`],
        }),
      });
      alert("✅ Message envoyé !");
      setFormMessage("");
    } catch (err) {
      console.error("❌ Erreur envoi admin :", err);
      alert("Erreur lors de l’envoi.");
    }
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

      {/* Bloc message admin */}
      <div style={{ marginTop: "3rem", padding: "1rem", background: "#1e1e1e", borderRadius: "8px" }}>
        <h2>📢 Envoyer un message ADMIN</h2>
        <textarea
          rows={5}
          placeholder="Message à envoyer sur Telegram"
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "1rem" }}
        />
        <button
          onClick={sendAdminPost}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4ea8de",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          📨 Envoyer le message
        </button>
      </div>
    </div>
  );
};

export default Admin;