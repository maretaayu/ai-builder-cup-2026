"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** true bila konfigurasi Firebase tersedia. Bila false, aplikasi berjalan dalam mode lokal. */
export const firebaseSiap = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);
export const pakaiEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

type Fb = { app: FirebaseApp; auth: Auth; db: Firestore };
let cache: Fb | null = null;

export function fb(): Fb | null {
  if (!firebaseSiap || typeof window === "undefined") return null;
  if (!cache) {
    const app = getApps().length ? getApp() : initializeApp(cfg);
    const auth = getAuth(app);
    const db = getFirestore(app);
    if (pakaiEmulator) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    }
    cache = { app, auth, db };
  }
  return cache;
}
