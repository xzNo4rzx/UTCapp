// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pendingUsers } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && panelRef.current && !panelRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  const linkStyle = {
    display: "block",
    padding: "1rem",
    color: "#fff",
    fontSize: "1.2rem",
    textDecoration: "none",
  };

  return (
    <>
      {/* ─── BURGER & TITLE ─────────────────────── */}
      <div style={{
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  padding: "1rem 1rem 1rem 1.5rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(8px)",
  zIndex: 1000,
}}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: "2rem",
            background: "transparent",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <h1 style={{
          color: "#4ea8de",
          fontFamily: "sans-serif",
          fontSize: "1.5rem",
          animation: "slideTitle 2s ease-in-out infinite alternate",
        }}>
          Ultimate Trading Champions
        </h1>
      </div>

      {/* ─── PANEL LATÉRAL ─────────────────────── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          left: menuOpen ? 0 : "-260px",
          width: "260px",
          height: "100%",
          backgroundImage: 'url("/backgrounds/menubackground.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "left 0.3s ease-in-out",
          zIndex: 999,
          paddingTop: "5rem",
          fontFamily: "sans-serif",
          borderRight: "1px solid #333",
          overflow: "hidden",
        }}
      >
        {/* ✅ OVERLAY TRANSPARENT */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          zIndex: 0,
        }} />

        {/* ✅ CONTENU */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link to="/" onClick={handleLinkClick} style={linkStyle}>🏠 Accueil</Link>
          {user && (
            <>
              <Link to="/trading" onClick={handleLinkClick} style={linkStyle}>💸 Trading</Link>
              <Link to="/ia-trader" onClick={handleLinkClick} style={linkStyle}>🤖 IA Trader</Link>
              <Link to="/analysis" onClick={handleLinkClick} style={linkStyle}>📊 Analyse</Link>
              <Link to="/signals" onClick={handleLinkClick} style={linkStyle}>🚨 Signaux</Link>
              <Link to="/profile" onClick={handleLinkClick} style={linkStyle}>👤 Profil</Link>
            </>
          )}
          {user?.email === "xzno4rzx@gmail.com" && (
            <Link to="/admin" onClick={handleLinkClick} style={{ ...linkStyle, color: "#4ea8de", position: "relative" }}>
              🛠️ Admin
              {pendingUsers > 0 && (
                <span style={{
                  position: "absolute",
                  top: "8px",
                  right: "20px",
                  background: "red",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "0.7rem",
                }}>{pendingUsers}</span>
              )}
            </Link>
          )}
          <div style={{ marginTop: "2rem" }}>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                style={{
                  ...linkStyle,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                🔓 Déconnexion
              </button>
            ) : (
              <Link to="/login" onClick={handleLinkClick} style={linkStyle}>
                🔐 Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── ANIMATION CSS ─────────────────────── */}
      <style>{`
        @keyframes slideTitle {
          0% { transform: translateX(0px); opacity: 0.8; }
          100% { transform: translateX(4px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Navbar;