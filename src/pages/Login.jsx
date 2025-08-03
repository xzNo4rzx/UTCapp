// src/pages/Login.jsx
const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (!docSnap.exists()) throw new Error("Utilisateur inconnu.");
      const userData = docSnap.data();

      if (!userData.approved) throw new Error("Compte en attente de validation.");

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur de connexion.");
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("/backgrounds/homebackground.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: 'fixed',
      minHeight: "100vh",
      padding: "6rem 1rem 2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      fontFamily: "sans-serif",
      color: "#fff"
    }}>
      <div style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>🔐 Connexion</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#4ea8de",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            Se connecter
          </button>
          {error && <p style={{ color: "salmon", textAlign: "center" }}>{error}</p>}
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ color: "#aaa" }}>Vous n’avez pas encore de compte ?</p>
          <Link to="/register" style={{ color: "#4ea8de", fontWeight: "bold", textDecoration: "none" }}>
            ➕ Faire une demande d’inscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;