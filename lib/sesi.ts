"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useSyncExternalStore } from "react";
import { fb, firebaseSiap } from "./firebase";

export type Peran = "dewasa" | "anak";
export type Profil = { peran?: Peran; nama?: string; ruangKode?: string; ruangNama?: string };
export type Sesi = {
  /** Auth sudah dicek (baik ada pengguna maupun tidak). */
  siap: boolean;
  firebase: boolean;
  user: { uid: string; anonim: boolean; nama: string; email: string } | null;
  profil: Profil | null;
};

const awal: Sesi = { siap: !firebaseSiap, firebase: firebaseSiap, user: null, profil: null };
let sesi: Sesi = awal;
const subs = new Set<() => void>();
let mulai = false;
let batalProfil: (() => void) | null = null;

function set(next: Sesi) {
  sesi = next;
  subs.forEach((f) => f());
}

function ringkas(u: User | null): Sesi["user"] {
  return u ? { uid: u.uid, anonim: u.isAnonymous, nama: u.displayName ?? "", email: u.email ?? "" } : null;
}

function mulaiPantau() {
  if (mulai || !firebaseSiap || typeof window === "undefined") return;
  mulai = true;
  const f = fb();
  if (!f) return;
  onAuthStateChanged(f.auth, (u) => {
    batalProfil?.();
    batalProfil = null;
    set({ ...sesi, siap: true, user: ringkas(u), profil: u ? sesi.profil : null });
    if (u) {
      batalProfil = onSnapshot(
        doc(f.db, "users", u.uid),
        (s) => set({ ...sesi, profil: (s.data() as Profil | undefined) ?? {} }),
        () => set({ ...sesi, profil: sesi.profil ?? {} }),
      );
    }
  });
}

function subscribe(cb: () => void) {
  mulaiPantau();
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

export function useSesi(): Sesi {
  return useSyncExternalStore(subscribe, () => sesi, () => awal);
}

/** Pesan galat yang ramah dan bisa ditindaklanjuti. */
export function pesanGalat(e: unknown, bahasa: "id" | "en"): string {
  const kode = (e as { code?: string })?.code ?? "";
  const id = bahasa === "id";
  const peta: Record<string, [string, string]> = {
    "auth/operation-not-allowed": [
      "Metode masuk ini belum diaktifkan di Firebase Console (Authentication > Sign-in method).",
      "This sign-in method isn't enabled in the Firebase Console yet (Authentication > Sign-in method).",
    ],
    "auth/invalid-credential": ["Email atau kata sandi salah.", "Wrong email or password."],
    "auth/wrong-password": ["Email atau kata sandi salah.", "Wrong email or password."],
    "auth/user-not-found": ["Akun belum terdaftar. Pilih Daftar.", "No account yet. Choose Sign up."],
    "auth/email-already-in-use": ["Email sudah terdaftar. Pilih Masuk.", "This email is already registered. Choose Sign in."],
    "auth/weak-password": ["Kata sandi minimal 6 karakter.", "Password must be at least 6 characters."],
    "auth/invalid-email": ["Format email tidak valid.", "Invalid email format."],
    "auth/popup-closed-by-user": ["Jendela masuk ditutup sebelum selesai.", "The sign-in window was closed before finishing."],
    "auth/popup-blocked": ["Pop-up diblokir browser. Izinkan pop-up lalu coba lagi.", "The pop-up was blocked. Allow pop-ups and try again."],
    "auth/unauthorized-domain": [
      "Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains).",
      "This domain isn't authorized in Firebase (Authentication > Settings > Authorized domains).",
    ],
    "permission-denied": [
      "Akses ditolak oleh aturan keamanan Firestore. Pastikan firestore.rules sudah di-deploy.",
      "Access denied by Firestore security rules. Make sure firestore.rules is deployed.",
    ],
    unavailable: ["Tidak bisa terhubung ke server. Periksa koneksi internet.", "Can't reach the server. Check your connection."],
  };
  const m = peta[kode];
  if (m) return id ? m[0] : m[1];
  return id ? "Terjadi kesalahan. Coba lagi." : "Something went wrong. Please try again.";
}

function auth() {
  const f = fb();
  if (!f) throw Object.assign(new Error("Firebase belum dikonfigurasi"), { code: "firebase/belum-siap" });
  return f;
}

export async function masukGoogle() {
  const { auth: a } = auth();
  await signInWithPopup(a, new GoogleAuthProvider());
}

export async function masukEmail(email: string, sandi: string, daftar: boolean, nama?: string) {
  const { auth: a } = auth();
  if (daftar) {
    const cred = await createUserWithEmailAndPassword(a, email, sandi);
    if (nama) await updateProfile(cred.user, { displayName: nama });
  } else {
    await signInWithEmailAndPassword(a, email, sandi);
  }
}

export async function masukTamu() {
  const { auth: a } = auth();
  if (a.currentUser) return a.currentUser;
  return (await signInAnonymously(a)).user;
}

export async function keluar() {
  const f = fb();
  if (f) await signOut(f.auth);
}

export async function simpanProfil(patch: Profil) {
  const f = auth();
  const u = f.auth.currentUser;
  if (!u) return;
  await setDoc(doc(f.db, "users", u.uid), { ...patch, diperbarui: serverTimestamp() }, { merge: true });
}
