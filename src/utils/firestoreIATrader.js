import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const loadIATrader = async (uid) => {
  try {
    const ref = doc(db, "iatraders", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("❌ Firestore loadIATrader:", e);
    return null;
  }
};

export const saveIATrader = async (uid, data) => {
  try {
    const ref = doc(db, "iatraders", uid);
    await setDoc(ref, data, { merge: true });
  } catch (e) {
    console.error("❌ Firestore saveIATrader:", e);
  }
};