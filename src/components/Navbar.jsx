 import React from "react";
 import { Link } from "react-router-dom";

 const Navbar = () => {
   return (
     <nav style={{
       display: "flex",
       justifyContent: "space-around",
       padding: "1rem",
       backgroundColor: "#222",
       color: "white"
     }}>
       <Link to="/" style={{ color: "white", textDecoration: "none" }}>🏠 Home</Link>
       <Link to="/trading" style={{ color: "white", textDecoration: "none" }}>📊 Trading</Link>
       <Link to="/analysis" style={{ color: "white", textDecoration: "none" }}>📈 Analyse</Link>
       <Link to="/signals" style={{ color: "white", textDecoration: "none" }}>🚨 Signaux</Link>
       <Link to="/ia-trader" style={{ color: "white", textDecoration: "none" }}>🤖 IA Trader</Link>
       <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>👤 Profil</Link>
     </nav>
   );
 };

 export default Navbar;