// utils/firestoreSignals.js
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// 🔁 Récupère les derniers signaux IA depuis Firestore
export const fetchLatestSignals = async (count = 50) => {
  try {
    const q = query(
      collection(db, "signals"),
      orderBy("timestamp", "desc"),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (e) {
    console.error("❌ Erreur chargement signaux Firestore :", e);
    return [];
  }
};