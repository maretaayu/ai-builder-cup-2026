"use client";

import { useSyncExternalStore } from "react";
import { fx } from "./fx";
import type { Bahasa } from "./kamus";

export type Species = "badak" | "nuri" | "penyu";
export type Weather = "cerah" | "mendung" | "hujan" | "badai";
export type Body = "kepala" | "dada" | "perut" | "tangan" | "tidak";
export type Level = "aman" | "perhatian" | "segera";
export type After = "lebih-baik" | "masih-berat";

export type Checkin = {
  id: string;
  ts: number;
  weather: Weather;
  body: Body;
  after?: After;
  level: Level;
};

export type Signal = {
  id: string;
  ts: number;
  to: string;
  weather?: Weather;
  body?: Body;
  level: Level;
  status: "baru" | "dibaca" | "ditanggapi";
  alasan?: string;
  saran?: string;
  /** true bila alasan dan saran dibuat oleh model AI */
  ai?: boolean;
};

export type State = {
  lang: Bahasa;
  companion?: { species: Species; name: string };
  stars: number;
  /** jumlah kegiatan belajar yang sudah diselesaikan, per jenis (cuaca, napas, tebak, ...) */
  progres: Record<string, number>;
  aktifTs?: number;
  checkins: Checkin[];
  circle: string[];
  signals: Signal[];
  sound: boolean;
};

const KEY = "ruang-rasa-v1";
const KEY_SUARA = "ruang-rasa-suara-v2";

const initial: State = {
  lang: "id",
  stars: 0,
  progres: {},
  checkins: [],
  circle: [],
  signals: [],
  sound: false,
};

let state: State = initial;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
    // Suara kini mati secara default: setel ulang sekali untuk pengguna lama yang tersimpan menyala.
    if (!window.localStorage.getItem(KEY_SUARA)) {
      state = { ...state, sound: false };
      window.localStorage.setItem(KEY_SUARA, "1");
    }
  } catch {
    // penyimpanan tidak tersedia: lanjut dengan keadaan awal
  }
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // abaikan
  }
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  load();
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return initial;
}

export function getState() {
  load();
  return state;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  adopt(species: Species, name: string) {
    commit({ ...state, companion: { species, name } });
  },
  addStar(n = 1, kegiatan?: string) {
    const progres = kegiatan ? { ...state.progres, [kegiatan]: (state.progres[kegiatan] ?? 0) + 1 } : state.progres;
    commit({ ...state, stars: state.stars + n, progres, aktifTs: Date.now() });
    if (n > 0) fx.bintang(n);
  },
  addCheckin(c: Omit<Checkin, "id" | "ts">) {
    const id = uid();
    commit({ ...state, checkins: [...state.checkins, { ...c, id, ts: Date.now() }] });
    return id;
  },
  updateCheckin(id: string, patch: Partial<Checkin>) {
    commit({
      ...state,
      checkins: state.checkins.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  },
  setCircle(circle: string[]) {
    commit({ ...state, circle });
  },
  sendSignal(s: Omit<Signal, "id" | "ts" | "status">) {
    const id = uid();
    commit({
      ...state,
      signals: [...state.signals, { ...s, id, ts: Date.now(), status: "baru" }],
    });
    return id;
  },
  updateSignal(id: string, patch: Partial<Signal>) {
    commit({
      ...state,
      signals: state.signals.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  },
  setSignalStatus(id: string, status: Signal["status"]) {
    commit({
      ...state,
      signals: state.signals.map((s) => (s.id === id ? { ...s, status } : s)),
    });
  },
  setLang(lang: Bahasa) {
    commit({ ...state, lang });
  },
  toggleSound() {
    commit({ ...state, sound: !state.sound });
  },
  seedDemo() {
    const day = 86_400_000;
    const now = Date.now();
    const seq: [Weather, Body, Level][] = [
      ["cerah", "tidak", "aman"],
      ["mendung", "perut", "aman"],
      ["cerah", "tidak", "aman"],
      ["hujan", "dada", "perhatian"],
      ["badai", "dada", "perhatian"],
      ["mendung", "kepala", "aman"],
    ];
    const demo: Checkin[] = seq.map(([weather, body, level], i) => ({
      id: uid(),
      ts: now - (seq.length - i) * day,
      weather,
      body,
      level,
    }));
    commit({ ...state, checkins: [...demo, ...state.checkins], stars: Math.max(state.stars, 6) });
  },
  reset() {
    commit({ ...initial });
  },
};
