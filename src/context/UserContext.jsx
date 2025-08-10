import React, { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPortfolio(snap.data().portfolio);
        } else {
          await setDoc(ref, {
            email: u.email,
            portfolio: { cash: 10000, positions: [], history: [] }
          });
          setPortfolio({ cash: 10000, positions: [], history: [] });
        }
      } else {
        setUser(null);
        setPortfolio(null);
      }
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, portfolio, setPortfolio }}>
      {children}
    </UserContext.Provider>
  );
};
