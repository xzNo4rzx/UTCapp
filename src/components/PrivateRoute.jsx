// FICHIER: ~/Documents/utc-app-full/src/components/PrivateRoute.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==== [BLOC: COMPOSANT] =====================================================
const PrivateRoute = ({ children, redirectTo = "/login" }) => {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  return user ? children : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Utilise le contexte Auth corrigé; plus d’appel direct à getAuth().