import React, { createContext, useEffect, useMemo, useState, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { apiFetch } from "../lib/apiClient";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const auth = useMemo(() => getAuth(app), []);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = useCallback(async (u) => {
    try {
      const token = await u.getIdToken();
      // Init côté API (création du doc si inexistant)
      await apiFetch("/me/init", { token });
      // Récupération du portefeuille
      const data = await apiFetch("/me/portfolio", { token });
      setPortfolio(data || { cash: 10000, positions: [], history: [] });
    } catch (e) {
      console.error("[UserContext] loadPortfolio error:", e);
      setPortfolio({ cash: 10000, positions: [], history: [] });
    }
  }, []);

  const savePortfolio = useCallback(async (next) => {
    try {
      if (!user) return;
      const token = await user.getIdToken();
      await apiFetch("/me/portfolio", { method: "POST", token, body: next });
      setPortfolio(next);
    } catch (e) {
      console.error("[UserContext] savePortfolio error:", e);
    }
  }, [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        setUser(u);
        await loadPortfolio(u);
      } else {
        setUser(null);
        setPortfolio(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [auth, loadPortfolio]);

  return (
    <UserContext.Provider value={{ user, portfolio, setPortfolio: savePortfolio, loading }}>
      {children}
    </UserContext.Provider>
  );
};
