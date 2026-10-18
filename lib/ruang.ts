"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { fb } from "./firebase";
import type { Checkin, Signal, Species } from "./store";

const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa karakter yang mirip (0/O, 1/I)

export const normalKode = (k: string) => k.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

function acakKode() {
  const b = new Uint32Array(6);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => HURUF[x % HURUF.length]).join("");
}

function db() {
  const f = fb();
  if (!f) throw Object.assign(new Error("Firebase belum dikonfigurasi"), { code: "firebase/belum-siap" });
  return f;
}

/** Orang dewasa membuat ruang (keluarga atau kelas) dan mendapat kode untuk perangkat anak. */
export async function buatRuang(nama: string): Promise<string> {
  const { db: d, auth } = db();
  const u = auth.currentUser;
  if (!u) throw Object.assign(new Error("Belum masuk"), { code: "auth/belum-masuk" });
  for (let i = 0; i < 5; i++) {
    const kode = acakKode();
    const ref = doc(d, "rooms", kode);
    const ok = await runTransaction(d, async (tx) => {
      // get pada ruang yang belum ada diizinkan oleh aturan untuk pengguna yang sudah masuk
      const s = await tx.get(ref);
      if (s.exists()) return false;
      tx.set(ref, { ownerUid: u.uid, nama: nama.slice(0, 60), dibuat: serverTimestamp() });
      return true;
    });
    if (ok) return kode;
  }
  throw new Error("Gagal membuat kode ruang");
}

/** Mengecek apakah kode ruang ada. Mengembalikan nama ruang, atau null. */
export async function cekRuang(kode: string): Promise<{ nama: string } | null> {
  const { db: d } = db();
  const s = await getDoc(doc(d, "rooms", normalKode(kode)));
  return s.exists() ? { nama: String(s.data().nama ?? "") } : null;
}

/** Perangkat anak mendaftarkan diri sebagai anggota ruang. */
export async function daftarAnggota(kode: string, anak: { nama: string; species: Species }) {
  const { db: d, auth } = db();
  const u = auth.currentUser;
  if (!u) return;
  await setDoc(doc(d, "rooms", kode, "anggota", u.uid), { ...anak, ts: serverTimestamp() }, { merge: true });
}

type SinyalMasuk = Omit<Signal, "id" | "ts" | "status"> & { nama?: string };

export async function kirimSinyal(kode: string, s: SinyalMasuk): Promise<string | null> {
  const { db: d, auth } = db();
  const u = auth.currentUser;
  if (!u) return null;
  const data = JSON.parse(JSON.stringify(s)) as Record<string, unknown>; // buang undefined
  const r = await addDoc(collection(d, "rooms", kode, "signals"), { ...data, anakUid: u.uid, status: "baru", ts: serverTimestamp() });
  return r.id;
}

export async function perbaruiSinyal(kode: string, id: string, patch: Partial<Signal>) {
  const { db: d } = db();
  const data = JSON.parse(JSON.stringify(patch)) as Record<string, unknown>;
  await updateDoc(doc(d, "rooms", kode, "signals", id), data);
}

export async function catatCekin(kode: string, c: Pick<Checkin, "weather" | "body" | "level">) {
  const { db: d, auth } = db();
  const u = auth.currentUser;
  if (!u) return;
  await addDoc(collection(d, "rooms", kode, "checkins"), { ...c, anakUid: u.uid, ts: serverTimestamp() });
}

const ms = (t: unknown) => (t && typeof (t as Timestamp).toMillis === "function" ? (t as Timestamp).toMillis() : Date.now());

/** Sinyal ruang secara langsung (real-time). `galat` terisi bila akses ditolak atau gagal. */
export function useSinyalRuang(kode?: string) {
  const [data, setData] = useState<{ kode?: string; sinyal: Signal[]; galat: string }>({ sinyal: [], galat: "" });
  useEffect(() => {
    const f = fb();
    if (!f || !kode) return;
    return onSnapshot(
      query(collection(f.db, "rooms", kode, "signals"), orderBy("ts", "desc"), limit(50)),
      (s) =>
        setData({
          kode,
          galat: "",
          sinyal: s.docs.map((x) => {
            const v = x.data();
            return { ...v, id: x.id, ts: ms(v.ts), status: v.status ?? "baru" } as Signal & { nama?: string };
          }),
        }),
      (e) => setData({ kode, sinyal: [], galat: (e as { code?: string }).code ?? "error" }),
    );
  }, [kode]);
  return kode && data.kode === kode ? data : { sinyal: [] as Signal[], galat: "" };
}

export function useCekinRuang(kode?: string) {
  const [data, setData] = useState<{ kode?: string; cekin: Checkin[] }>({ cekin: [] });
  useEffect(() => {
    const f = fb();
    if (!f || !kode) return;
    return onSnapshot(
      query(collection(f.db, "rooms", kode, "checkins"), orderBy("ts", "desc"), limit(200)),
      (s) =>
        setData({
          kode,
          cekin: s.docs.map((x) => {
            const v = x.data();
            return { ...v, id: x.id, ts: ms(v.ts) } as Checkin;
          }),
        }),
      () => setData({ kode, cekin: [] }),
    );
  }, [kode]);
  return kode && data.kode === kode ? data.cekin : [];
}


/** Satu anak = satu ruang dengan kode sendiri. Nama ruang adalah nama anak. */
export type RuangAnak = { kode: string; nama: string; dibuat: number };

export function useDaftarAnak(uid?: string) {
  const [data, setData] = useState<{ uid?: string; anak: RuangAnak[]; galat: string }>({ anak: [], galat: "" });
  useEffect(() => {
    const f = fb();
    if (!f || !uid) return;
    return onSnapshot(
      query(collection(f.db, "rooms"), where("ownerUid", "==", uid)),
      (s) =>
        setData({
          uid,
          galat: "",
          anak: s.docs
            .map((x) => ({ kode: x.id, nama: String(x.data().nama ?? ""), dibuat: ms(x.data().dibuat) }))
            .sort((a, b) => a.dibuat - b.dibuat),
        }),
      (e) => setData({ uid, anak: [], galat: (e as { code?: string }).code ?? "error" }),
    );
  }, [uid]);
  return uid && data.uid === uid ? data : { anak: [] as RuangAnak[], galat: "" };
}

/** Perangkat anak yang sudah terhubung ke sebuah ruang, beserta kemajuan belajarnya. */
export type Anggota = {
  uid: string;
  nama: string;
  species: Species;
  stars?: number;
  progres?: Record<string, number>;
  aktifTs?: number;
};

export function useAnggota(kode?: string) {
  const [data, setData] = useState<{ kode?: string; anggota: Anggota[] }>({ anggota: [] });
  useEffect(() => {
    const f = fb();
    if (!f || !kode) return;
    return onSnapshot(
      collection(f.db, "rooms", kode, "anggota"),
      (s) => setData({ kode, anggota: s.docs.map((x) => ({ ...(x.data() as Omit<Anggota, "uid">), uid: x.id })) }),
      () => setData({ kode, anggota: [] }),
    );
  }, [kode]);
  return kode && data.kode === kode ? data.anggota : [];
}

/** Perangkat anak mengirim kemajuan belajarnya agar terlihat oleh orang tua. */
export async function sinkronProgres(kode: string, p: { stars: number; progres: Record<string, number>; aktifTs?: number }) {
  const { db: d, auth } = db();
  const u = auth.currentUser;
  if (!u) return;
  const data = JSON.parse(JSON.stringify(p)) as Record<string, unknown>;
  await setDoc(doc(d, "rooms", kode, "anggota", u.uid), data, { merge: true });
}
