// FICHIER: ~/Documents/utc-app-full/src/context/AdminContext.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// ==== [BLOC: CONTEXTE] ======================================================
const AdminContext = createContext({ pendingUsers: 0 });

// ==== [BLOC: HOOK] ==========================================================
export const useAdmin = () => useContext(AdminContext);

// ==== [BLOC: PROVIDER] ======================================================
export const AdminProvider = ({ children }) => {
  const [pendingUsers, setPendingUsers] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // ==== [BLOC: STRAT FALBACK] =========================================
        // 1) essaie 'users' où approved == false
        // 2) sinon 'pendingUsers' (juste compter les docs)
        let count = 0;

        // Tentative 1: users non approuvés
        try {
          const q = query(collection(db, "users"), where("approved", "==", false));
          const snap = await getDocs(q);
          count = snap.size;
        } catch (_) {
          // ignore
        }

        // Tentative 2: fallback collection "pendingUsers"
        if (count === 0) {
          try {
            const snap2 = await getDocs(collection(db, "pendingUsers"));
            count = snap2.size;
          } catch (_) {
            // ignore
          }
        }

        if (!cancelled) setPendingUsers(count);
      } catch {
        if (!cancelled) setPendingUsers(0);
      }
    };

    load();
    const id = setInterval(load, 30_000); // refresh toutes les 30s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <AdminContext.Provider value={{ pendingUsers }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Import/usage corrects de Firestore via 'db' exporté.
// - Fournit pendingUsers avec double fallback (users.approved=false puis pendingUsers).
// - Annotations de blocs incluses.