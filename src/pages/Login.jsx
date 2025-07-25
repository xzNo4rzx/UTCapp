import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
        <button type="submit">Se connecter</button>
        {error && <p style={{ color: "salmon" }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;