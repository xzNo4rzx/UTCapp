import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Trading from './pages/Trading.jsx';
import Analysis from './pages/Analysis.jsx';
import Signals from './pages/Signals.jsx';
import IATrader from "./pages/IATrader.jsx";
import Profile from './pages/Profile.jsx';
import { PortfolioProvider } from "./context/PortfolioContext";
import { IATraderProvider } from "./context/IATraderContext";

const App = () => {
  console.log('✅ App.jsx chargé');
  return (
    <PortfolioProvider>
      <IATraderProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/ia-trader" element={<IATrader />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </IATraderProvider>
    </PortfolioProvider>
  );
};

export default App;