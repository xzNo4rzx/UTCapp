import "./boot/apiFetchPatch";
// src/main.jsx
import React from "react";
import { UserProvider } from "./context/UserContext.jsx";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PortfolioProvider } from "./context/PortfolioContext.jsx";
import { IATraderProvider } from "./context/IATraderContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <PortfolioProvider>
          <IATraderProvider>
            <AdminProvider>
              <UserProvider><App /></UserProvider>
            </AdminProvider>
          </IATraderProvider>
        </PortfolioProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);