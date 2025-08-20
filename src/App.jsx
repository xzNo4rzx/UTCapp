// src/App.jsx
import Trading from "./pages/Trading.jsx";
import './styles/trading.css'
import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Analysis from "./pages/Analysis.jsx";
import Signals from "./pages/Signals.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Admin from "./pages/Admin.jsx";
import PricesProbe from "./components/PricesProbe"; // ajuste le chemin si besoin
import DebugBar from "./components/DebugBar";

const App = () => {
  useEffect(() => {
    console.log("✅ UTC App initialisée avec routes.");
  }, []);
  console.log("✅ App.jsx chargé");

<DebugBar />

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/trading" element={<PrivateRoute><Trading /></PrivateRoute>} />
        <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
        <Route path="/signals" element={<PrivateRoute><Signals /></PrivateRoute>} />
        <Route path="/ia-trader" element={<PrivateRoute><Trading /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<Admin />} />
        
      </Routes>
      <PricesProbe />
    </>
  );
};

export default App;
