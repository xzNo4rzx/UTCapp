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
    <div style={{ padding: "2rem", color: "#fff", fontFamily: "sans-serif" }}>
      <h2>🔐 Connexion</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "8px", backgroundColor: "#4ea8de", color: "#fff", border: "none", borderRadius: "4px" }}>
          Se connecter
        </button>
        {error && <p style={{ color: "salmon" }}>{error}</p>}
      </form>

      <div style={{ marginTop: "1.5rem" }}>
        <p style={{ color: "#aaa" }}>Vous n’avez pas encore de compte ?</p>
        <Link to="/register" style={{ color: "#4ea8de", fontWeight: "bold", textDecoration: "none" }}>
          ➕ Faire une demande d’inscription
        </Link>
      </div>
    </div>
  );
};

export default Login;