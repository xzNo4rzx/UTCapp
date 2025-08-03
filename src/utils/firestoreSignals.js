// 🔥 src/utils/firestoreSignals.js
import { db } from "../firebase"; 
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// 📥 Récupère les signaux Firestore (max = 30 par défaut)
const fetchLatestSignals = async (max = 30) => {
  try {
    const q = query(
      collection(db, "signals"),
      orderBy("timestamp", "desc"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error("❌ Erreur Firestore fetch signals:", err);
    return [];
  }
};

export default fetchLatestSignals;