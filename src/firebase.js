// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3CAXoBMk5KIb80UgqSY0mNJQISHMfZ9c",
  authDomain: "no4r-utc-app.firebaseapp.com",
  projectId: "no4r-utc-app",
  storageBucket: "no4r-utc-app.appspot.com",
  messagingSenderId: "139910089353",
  appId: "1:139910089353:web:dce994c30e4756331b5458",
  measurementId: "G-VQD24XFCB2",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };