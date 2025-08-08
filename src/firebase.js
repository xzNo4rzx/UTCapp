// FICHIER: ~/Documents/utc-app-full/src/firebase.js

// ==== [BLOC: IMPORTS] =======================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ==== [BLOC: CONFIG] ========================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ==== [BLOC: INIT] ==========================================================
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Nouveau point d'entrée Firebase V9: initialise l'app et exporte `auth`.
// - Corrige l’erreur "getAuth is not defined" en centralisant l’import/usage.