// FICHIER: ~/Documents/utc-app-full/src/firebase.js

// ==== [BLOC: IMPORTS] =======================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ==== [BLOC: CONFIG] ========================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ==== [BLOC: GUARD / DIAGNOSTIC] ===========================================
// Masque les valeurs pour log (évite fuite complète en console)
const _mask = (v) => (typeof v === "string" && v.length > 8 ? v.slice(0, 4) + "…" + v.slice(-4) : String(v));
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined" || firebaseConfig.apiKey === "null") {
  // Log compact pour t’indiquer quoi manque au build
  console.error(
    "[Firebase] Variables manquantes au build:",
    {
      apiKey: !!firebaseConfig.apiKey ? _mask(firebaseConfig.apiKey) : "(absente)",
      authDomain: firebaseConfig.authDomain || "(absent)",
      projectId: firebaseConfig.projectId || "(absent)",
      storageBucket: firebaseConfig.storageBucket || "(absent)",
      messagingSenderId: firebaseConfig.messagingSenderId || "(absent)",
      appId: firebaseConfig.appId || "(absent)",
    }
  );
  throw new Error("Firebase config invalide: VITE_FIREBASE_API_KEY absente côté frontend build");
}

// ==== [BLOC: INIT] ==========================================================
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Lecture exclusive via import.meta.env.VITE_* (obligatoire avec Vite).
// - Guard qui throw si apiKey manquante et log masqué pour diagnostiquer.