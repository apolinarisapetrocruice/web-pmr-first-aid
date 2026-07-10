import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBzRpvTd67jxU13cbx1QgUKVGuGkb_qVpM",
  authDomain: "pmrfirstaid.firebaseapp.com",
  projectId: "pmrfirstaid",
  storageBucket: "pmrfirstaid.firebasestorage.app",
  messagingSenderId: "591541794476",
  appId: "1:591541794476:web:dbbfb8257508efdc9b1109",
  measurementId: "G-T3B1H1VHPK",
  databaseURL: "https://pmrfirstaid-default-rtdb.firebaseio.com/"
};

// Initialize Firebase with HMR check
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getDatabase(app);
