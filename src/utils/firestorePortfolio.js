import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const loadPortfolio = async (uid) => {
  const ref = doc(db, "portfolios", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const savePortfolio = async (uid, data) => {
  const ref = doc(db, "portfolios", uid);
  await setDoc(ref, data, { merge: true });
};