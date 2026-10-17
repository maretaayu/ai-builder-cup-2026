"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { useL } from "@/components/lms/util";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { actions } from "@/lib/store";

const PERTANYAAN: { id: string; mood: Mood; id_: string; en: string; aksi: "napas" | "aman" }[] = [
  { id: "berdebar", mood: "bingung", id_: "Kenapa dadaku berdebar?", en: "Why is my heart pounding?", aksi: "napas" },
  { id: "marah", mood: "marah", id_: "Kenapa aku marah?", en: "Why do I get angry?", aksi: "napas" },
  { id: "sedih", mood: "sedih", id_: "Kenapa aku sedih?", en: "Why do I feel sad?", aksi: "aman" },
  { id: "takut", mood: "bingung", id_: "Kenapa aku takut?", en: "Why do I feel scared?", aksi: "aman" },
  { id: "diejek", mood: "sedih", id_: "Kalau temanku mengejekku?", en: "What if a friend teases me?", aksi: "aman" },
  { id: "bilang-dewasa", mood: "tenang", id_: "Kapan bilang ke orang dewasa?", en: "When do I tell a grown-up?", aksi: "aman" },
];

type Jawaban = { jawaban: string; tips: string; ai: boolean };

export default function TanyaBoni() {
  const companion = useCompanion();
  const { l, lang } = useL();
  const [tahap, setTahap] = useState<"daftar" | "muat" | "jawaban">("daftar");
  const [aktif, setAktif] = useState(PERTANYAAN[0]);
  const [j, setJ] = useState<Jawaban | null>(null);
  const [mode, setMode] = useState<"jelas" | "lagi" | "contoh">("jelas");
  const sudahBintang = useRef(false);
  const token = useRef(0);

  if (!companion) return null;
  const nama = companion.name;

  async function tanya(q: (typeof PERTANYAAN)[number], m: "jelas" | "lagi" | "contoh") {
    setAktif(q);
    setMode(m);
    setTahap("muat");
    const mine = ++token.current;
    let hasil: Jawaban | null = null;
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 25_000);
      const r = await fetch("/api/tanya-boni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, nama, species: companion!.species, q: q.id, mode: m }),
        signal: ctrl.signal,
      });
      window.clearTimeout(timer);
      if (r.ok) hasil = (await r.json()) as Jawaban;
    } catch {
      // jatuh ke pesan umum di bawah
    }
    if (mine !== token.current) return;
    const final = hasil ?? { jawaban: l("Boni sedang sulit menjawab. Coba tanya lagi, ya.", "I'm having trouble answering. Please ask again."), tips: "", ai: false };
    setJ(final);
    setTahap("jawaban");
    sfx.pop();
    speak(final.jawaban);
    if (!sudahBintang.current && hasil) {
      sudahBintang.current = true;
      actions.addStar(1);
    }
  }

  if (tahap === "daftar") {
    return (
      <ChildShell tone="kunyit">
        <Say text={l(`Mau tanya apa ke ${nama}? Pilih satu.`, `What would you like to ask ${nama}? Pick one.`)} mood="senang" size={110} />
        <ul className="stagger mt-4 grid gap-3">
          {PERTANYAAN.map((q) => (
            <li key={q.id}>
              <button type="button" className="kartu flex w-full items-center gap-3 px-3 py-2 text-left" onClick={() => void tanya(q, "jelas")}>
                <Creature species={companion.species} mood={q.mood} size={56} className="shrink-0" />
                <span className="font-judul text-xl font-extrabold leading-tight">{l(q.id_, q.en)}</span>
              </button>
            </li>
          ))}
        </ul>
      </ChildShell>
    );
  }

  if (tahap === "muat") {
    return (
      <ChildShell tone="kunyit" back={false}>
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="anim-goyang">
            <Creature species={companion.species} mood="bingung" size={180} />
          </div>
          <p className="mt-4 font-judul text-2xl font-extrabold">{l(`${nama} sedang berpikir...`, `${nama} is thinking...`)}</p>
          <div className="mt-3 flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="anim-naik-turun size-3.5 rounded-full border-[3px] border-tinta bg-laut" style={{ animationDelay: `${i * 0.25}s` }} />
            ))}
          </div>
        </div>
      </ChildShell>
    );
  }

  return (
    <ChildShell tone="kunyit" back={false}>
      <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">{l(aktif.id_, aktif.en)}</p>
      <div className="anim-muncul mt-2 flex flex-col items-center rounded-[2rem] border-[3px] border-tinta bg-white p-4 shadow-[0_5px_0_var(--ink)]">
        <Creature species={companion.species} mood="tenang" size={150} sentuh />
        <p className="mt-2 text-center text-xl font-bold leading-snug">{j?.jawaban}</p>
        {j?.tips && (
          <p className="mt-3 rounded-full border-2 border-tinta bg-laut-muda px-3 py-1 text-center text-sm font-extrabold">{j.tips}</p>
        )}
        <span className="mt-3 rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-[11px] font-bold">
          {j?.ai ? l("Dijawab Gemini", "Answered by Gemini") : l("Jawaban pilihan", "Ready-made answer")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-putih btn-kecil" onClick={() => j && speak(j.jawaban)}>
          {l("Dengar lagi", "Listen again")}
        </button>
        <button type="button" className="btn btn-putih btn-kecil" onClick={() => void tanya(aktif, "lagi")}>
          {l("Jelaskan lagi", "Explain again")}
        </button>
        <button type="button" className="btn btn-putih btn-kecil" onClick={() => void tanya(aktif, "contoh")}>
          {l("Kasih contoh", "Give an example")}
        </button>
        <Link href={aktif.aksi === "napas" ? "/napas" : "/aman"} className="btn btn-kecil btn-laut">
          {aktif.aksi === "napas" ? l("Coba napas balon", "Try balloon breathing") : l("Lingkaran Aman", "Safe Circle")}
        </Link>
      </div>
      <button type="button" className="btn btn-karang mt-4 w-full" onClick={() => setTahap("daftar")}>
        {l("Tanya yang lain", "Ask something else")}
      </button>
      <span className="sr-only">{mode}</span>
    </ChildShell>
  );
}
