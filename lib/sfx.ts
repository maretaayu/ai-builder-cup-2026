"use client";

import { getState } from "./store";

let ctx: AudioContext | null = null;
let napas: { osc: OscillatorNode; gain: GainNode } | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !getState().sound) return null;
  if (!ctx) {
    const C =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Opt = { type?: OscillatorType; vol?: number; delay?: number; to?: number };

function tone(freq: number, dur: number, o: Opt = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.06, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

/** Suara efek kecil dan lembut, dibuat dengan WebAudio (tanpa file audio). */
export const sfx = {
  tap: () => tone(660, 0.04, { vol: 0.025, type: "triangle" }),
  pop: () => tone(380, 0.1, { to: 760, vol: 0.06 }),
  ding: () => {
    tone(988, 0.22, { vol: 0.05, type: "triangle" });
    tone(1480, 0.3, { delay: 0.07, vol: 0.035 });
  },
  benar: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, { delay: i * 0.08, vol: 0.05, type: "triangle" })),
  salah: () => tone(260, 0.22, { to: 200, vol: 0.04 }),
  whoosh: () => tone(520, 0.55, { to: 180, vol: 0.03, type: "triangle" }),
  napasMulai: () => {
    const c = audio();
    if (!c || napas) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const t = c.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(196, t);
    osc.frequency.linearRampToValueAtTime(294, t + 4);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.4);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    napas = { osc, gain };
  },
  napasBerhenti: () => {
    if (!napas || !ctx) return;
    const { osc, gain } = napas;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.stop(t + 0.35);
    napas = null;
  },
};

/** Getaran halus di perangkat yang mendukung. */
export function getar(pola: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pola);
  } catch {
    // tidak didukung
  }
}
