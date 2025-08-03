import React, { useEffect, useState } from "react";
const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
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
      const res = await fetch("https://utc-api.onrender.com/send-manual-signal", {
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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    <div style={{
      backgroundImage: 'url("/backgrounds/homebackground.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: isDesktop ? "fixed" : "scroll",
      padding: "6rem 2rem 2rem",
      color: "#fff",
      fontFamily: "sans-serif",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        padding: "2rem",
        borderRadius: "12px",
        marginBottom: "2rem"
      }}>
        <h1>🛠️ Tableau de bord Admin</h1>

        {/* Utilisateurs */}
        <div style={{ overflowX: "auto", marginTop: "2rem" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
            minWidth: "600px"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#333" }}>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Nom</th>
                <th style={cellStyle}>Statut</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? "#222" : "#2a2a2a" }}>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}>{u.displayName || "—"}</td>
                  <td style={{ ...cellStyle, color: u.status === "accepted" ? "lightgreen" : u.status === "refused" ? "salmon" : "#ccc" }}>
                    {u.status || "en attente"}
                  </td>
                  <td style={cellStyle}>
                    <button onClick={() => updateStatus(u.id, "accepted")} style={btnStyle}>✅</button>
                    <button onClick={() => updateStatus(u.id, "refused")} style={{ ...btnStyle, backgroundColor: "#a00" }}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Admin */}
      <div style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        padding: "2rem",
        borderRadius: "12px"
      }}>
        <h2>📨 Envoyer un message admin</h2>
        <textarea
          rows={4}
          value={adminMessage}
          onChange={e => setAdminMessage(e.target.value)}
          placeholder="Votre message ici…"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #444",
            fontFamily: "inherit",
            marginTop: "0.5rem"
          }}
        />
        <button
          onClick={sendAdminMessage}
          disabled={sending}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            backgroundColor: "#4ea8de",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {sending ? "Envoi…" : "🚀 Envoyer"}
        </button>
      </div>
    </div>
  );
};

const cellStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #444"
};

const btnStyle = {
  padding: "6px 10px",
  marginRight: "6px",
  backgroundColor: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

export default Admin;