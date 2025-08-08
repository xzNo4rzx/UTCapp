// FICHIER: ~/Documents/utc-app-full/src/context/AuthContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useEffect, useState, useContext } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// ==== [BLOC: CONTEXTE] ======================================================
const AuthContext = createContext(null);

// ==== [BLOC: HOOK] ==========================================================
export const useAuth = () => useContext(AuthContext);

// ==== [BLOC: PROVIDER] ======================================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setInitializing(false);
    });
    return () => unsub();
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, initializing, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Import explicite Firebase Auth V9 et usage via `auth` centralisé.
// - Remplace toute référence à getAuth() inline par l’instance `auth` partagée.
// - Ajout useEffect import manquant si nécessaire.