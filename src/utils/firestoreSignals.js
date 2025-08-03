// src/utils/firestoreSignals.js
import { db } from "../firebase"; // ✅ Assure-toi que le chemin est correct
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

// 🔁 Export obligatoire : fetchLatestSignals
export async function fetchLatestSignals(count = 25) {
  const ref = collection(db, "signals");
  const q = query(ref, orderBy("timestamp", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}