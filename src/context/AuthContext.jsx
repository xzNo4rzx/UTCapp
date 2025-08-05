import React, { useState, useEffect } from "react";
// src/context/AuthContext.jsx
import { createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("🧾 UID Firebase :", firebaseUser.uid);
        // autorisation auto pour admin
        if (firebaseUser.email === "xzno4rzx@gmail.com") {
          setUser(firebaseUser);
          return;
        }

        try {
          const userDoc = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userDoc);

          if (snap.exists()) {
            const data = snap.data();
            if (data.approved === true) {
              setUser(firebaseUser);
            } else {
              await signOut(auth);
              setUser(null);
              alert("🚫 Votre compte n’a pas encore été approuvé.");
            }
          } else {
            await signOut(auth);
            setUser(null);
            alert("❌ Utilisateur inconnu.");
          }
        } catch (err) {
          console.error("Erreur AuthContext:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);