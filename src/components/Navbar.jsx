// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pendingUsers } = useAdmin(); // ✅ récupère les notifs admin

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        backgroundColor: "#1e1e1e",
        padding: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          🏠 Accueil
        </Link>

        {user && (
          <>
            <Link to="/trading" style={{ color: "#fff", textDecoration: "none" }}>
              💸 Trading
            </Link>
            <Link to="/ia-trader" style={{ color: "#fff", textDecoration: "none" }}>
              🤖 IA Trader
            </Link>
            <Link to="/analysis" style={{ color: "#fff", textDecoration: "none" }}>
              📊 Analyse
            </Link>
            <Link to="/signals" style={{ color: "#fff", textDecoration: "none" }}>
              🚨 Signaux
            </Link>
            <Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>
              👤 Profil
            </Link>
          </>
        )}

        {user?.email === "xzno4rzx@gmail.com" && (
          <Link to="/admin" style={{ color: "#4ea8de", textDecoration: "none", position: "relative" }}>
            🛠️ Admin
            {pendingUsers > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-10px",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                }}
              >
                {pendingUsers}
              </span>
            )}
          </Link>
        )}
      </div>

      <div>
        {user ? (
          <button
            onClick={logout}
            style={{
              background: "transparent",
              color: "#ccc",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔓 Déconnexion
          </button>
        ) : (
          <Link to="/login" style={{ color: "#ccc", textDecoration: "none" }}>
            🔐 Connexion
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;