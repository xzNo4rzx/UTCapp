// src/context/AdminContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [pendingUsers, setPendingUsers] = useState(0);

  const fetchPending = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const pending = snap.docs.filter((d) => d.data().status !== "accepted").length;
      setPendingUsers(pending);
    } catch (err) {
      console.error("Erreur fetchPending :", err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <AdminContext.Provider value={{ pendingUsers, refreshPending: fetchPending }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);