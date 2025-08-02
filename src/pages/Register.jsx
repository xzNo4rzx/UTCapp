// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        email,
        displayName: "",
        approved: false,
        createdAt: new Date().toISOString(),
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("/backgrounds/homebackground.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
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
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>📝 Demande d'inscription</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>Email :</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>Mot de passe :</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" }}
            />
          </div>
          {error && <div style={{ color: "salmon", textAlign: "center" }}>{error}</div>}
          <button
            type="submit"
            style={{
              backgroundColor: "#4ea8de",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            S’inscrire
          </button>
        </form>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#aaa", textAlign: "center" }}>
          Une fois votre compte créé, il devra être validé par l’administrateur avant que vous puissiez vous connecter.
        </p>
      </div>
    </div>
  );
};

export default Register;