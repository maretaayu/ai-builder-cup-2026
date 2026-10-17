"use client";

import { useEffect } from "react";
import { LOKAL } from "./useT";
import { getState, useStore, type Species } from "./store";

/** Suara Gemini (lewat /api/suara) dengan cadangan suara bawaan browser. */

const SUARA_MASKOT: Record<Species, string> = { badak: "Puck", nuri: "Zephyr", penyu: "Kore" };

let token = 0;
let sekarang: HTMLAudioElement | null = null;
// Suara Gemini hanya dipakai bila NEXT_PUBLIC_SUARA_AWAN=1 (butuh kuota TTS berbayar).
// Selain itu seluruh suara memakai suara browser agar konsisten.
let awanMati = process.env.NEXT_PUBLIC_SUARA_AWAN !== "1";
const cache = new Map<string, Promise<string | null>>();

function suaraBrowser(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LOKAL[getState().lang];
  u.rate = 0.88;
  u.pitch = 1.15;
  const prefix = getState().lang;
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (voice) u.voice = voice;
  synth.cancel();
  synth.speak(u);
}

function ambilAudio(text: string, voice: string): Promise<string | null> {
  const key = `${voice}|${text}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(`/api/suara?${new URLSearchParams({ t: text, v: voice })}`)
      .then(async (r) => {
        if (r.status === 503 || r.status === 429) {
          // kuota habis atau belum aktif: pakai suara browser untuk seterusnya agar tidak bercampur
          awanMati = true;
          return null;
        }
        if (!r.ok) return null;
        return URL.createObjectURL(await r.blob());
      })
      .catch(() => null);
    cache.set(key, p);
    void p.then((u) => {
      if (!u) cache.delete(key);
    });
  }
  return p;
}

export function stopSpeaking() {
  token += 1;
  if (sekarang) {
    sekarang.pause();
    sekarang = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function speak(text: string) {
  if (typeof window === "undefined") return;
  stopSpeaking();
  const mine = token;
  if (awanMati) return suaraBrowser(text);
  const species = getState().companion?.species;
  const voice = species ? SUARA_MASKOT[species] : "Kore";
  void ambilAudio(text, voice).then((url) => {
    if (mine !== token) return;
    if (!url) return suaraBrowser(text);
    const a = new Audio(url);
    sekarang = a;
    a.play().catch(() => suaraBrowser(text));
  });
}

/** Ucapkan teks saat tampil, selama suara aktif. */
export function useSay(text: string | undefined) {
  const { sound } = useStore();
  useEffect(() => {
    if (!text || !sound) return;
    const t = window.setTimeout(() => speak(text), 350);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
    };
  }, [text, sound]);
}
