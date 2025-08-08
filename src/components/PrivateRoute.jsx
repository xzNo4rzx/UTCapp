// src/components/PrivateRoute.jsx
import React, { useEffect, useState, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking, allowed, denied, admin

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return setStatus("denied");

      if (user.email === "xzno4rzx@gmail.com") {
        // Autorisé partout
        return setStatus("allowed");
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setStatus(data.status === "accepted" ? "allowed" : "denied");
        } else {
          setStatus("denied");
        }
      } catch (e) {
        console.error("Erreur Firestore :", e);
        setStatus("denied");
      }
    };

    checkAccess();
  }, [user]);

  if (status === "checking") return <div style={{ color: "#ccc", padding: "2rem" }}>🔒 Vérification...</div>;
  if (status === "denied") return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;