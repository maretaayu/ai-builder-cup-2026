"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { useL } from "@/components/lms/util";
import { fx } from "@/lib/fx";
import { translate } from "@/lib/kamus";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { actions, useStore } from "@/lib/store";

type Pilihan = { teks: string; jenis: string; hasil: string; mood: Mood };
type Cerita = { judul: string; adegan: string; pilihan: Pilihan[]; pelajaran: string; ai: boolean };

const TEMA: { id: string; mood: Mood; id_: string; en: string }[] = [
  { id: "diejek", mood: "sedih", id_: "Diejek teman", en: "Teased by a friend" },
  { id: "tidak-diajak", mood: "sedih", id_: "Tidak diajak main", en: "Not invited to play" },
  { id: "berebut", mood: "marah", id_: "Berebut mainan", en: "Fighting over a toy" },
  { id: "kelas-baru", mood: "bingung", id_: "Kelas baru", en: "A new class" },
  { id: "maju-depan", mood: "bingung", id_: "Maju ke depan kelas", en: "Standing in front of class" },
  { id: "kangen", mood: "sedih", id_: "Kangen rumah", en: "Missing home" },
];

const temaAcak = () => TEMA[Math.floor(Math.random() * TEMA.length)].id;

/** Cerita cadangan dari konten tetap bila model tidak tersedia atau keluarannya tidak lolos pemeriksaan. */
function cadangan(lang: "id" | "en", nama: string, tema: string): Cerita {
  const s = ["diejek", "berebut", "maju-depan"].includes(tema) ? "s1" : "s2";
  const t = (k: string) => translate(lang, k as never, { n: nama });
  const jenis = s === "s1" ? ["tenang", "tegas", "kurang"] : ["tegas", "minta-tolong", "kurang"];
  const mood: Mood[] = s === "s1" ? ["tenang", "senang", "marah"] : ["senang", "tenang", "sedih"];
  return {
    judul: t(`cerita.${s}.latar`),
    adegan: t(`cerita.${s}.cerita`),
    pelajaran: lang === "en" ? "Asking for help is brave." : "Meminta tolong itu berani.",
    pilihan: [1, 2, 3].map((i) => ({
      teks: t(`cerita.${s}.p${i}.teks`),
      hasil: t(`cerita.${s}.p${i}.hasil`),
      jenis: jenis[i - 1],
      mood: mood[i - 1],
    })),
    ai: false,
  };
}

export default function CeritaAjaib() {
  const companion = useCompanion();
  const { l, lang } = useL();
  const { stars } = useStore();
  const [tahap, setTahap] = useState<"tema" | "muat" | "adegan" | "hasil">("tema");
  const [cerita, setCerita] = useState<Cerita | null>(null);
  const [jawab, setJawab] = useState<Pilihan | null>(null);
  const [temaDipilih, setTemaDipilih] = useState("diejek");
  const token = useRef(0);

  if (!companion) return null;
  const nama = companion.name;

  async function buat(tema: string) {
    const acak = tema === "acak" ? temaAcak() : tema;
    setTemaDipilih(acak);
    setTahap("muat");
    const mine = ++token.current;
    let hasil: Cerita | null = null;
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 30_000);
      const r = await fetch("/api/cerita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, nama, species: companion!.species, tema: acak, cuaca: "mendung" }),
        signal: ctrl.signal,
      });
      window.clearTimeout(timer);
      const j = await r.json();
      if (r.ok && !j.fallback) {
        hasil = { judul: j.judul, adegan: j.adegan, pelajaran: j.pelajaran, ai: true, pilihan: j.pilihan };
      }
    } catch {
      // jatuh ke cerita cadangan
    }
    if (mine !== token.current) return;
    const final = hasil ?? cadangan(lang, nama, acak);
    setCerita(final);
    setTahap("adegan");
    speak(final.adegan);
  }

  function pilih(p: Pilihan) {
    setJawab(p);
    setTahap("hasil");
    const bijak = p.jenis !== "kurang";
    (bijak ? sfx.benar : sfx.salah)();
    actions.addStar(bijak ? 2 : 1);
    if (bijak) fx.rayakan();
    speak(`${p.hasil} ${bijak && cerita ? cerita.pelajaran : ""}`);
  }

  if (tahap === "tema") {
    return (
      <ChildShell tone="laut">
        <Say text={l(`Mau cerita tentang apa? ${nama} akan membuatkan cerita baru untukmu.`, `What should the story be about? ${nama} will make a brand-new story for you.`)} mood="senang" size={110} />
        <ul className="stagger mt-4 grid grid-cols-2 gap-3">
          {TEMA.map((t) => (
            <li key={t.id}>
              <button type="button" className="kartu flex h-full w-full flex-col items-center gap-1 px-2 py-3 text-center" onClick={() => void buat(t.id)}>
                <Creature species={companion.species} mood={t.mood} size={64} />
                <span className="font-judul text-lg font-extrabold leading-tight">{l(t.id_, t.en)}</span>
              </button>
            </li>
          ))}
          <li className="col-span-2">
            <button type="button" className="btn btn-karang w-full" onClick={() => void buat("acak")}>
              {l("Kejutan! Pilihkan untukku", "Surprise me!")}
            </button>
          </li>
        </ul>
        <p className="mt-4 text-center text-xs font-bold text-tinta-lembut">{l("Cerita dibuat oleh Gemini setiap kali, jadi selalu baru.", "Stories are written by Gemini each time, so they're always new.")}</p>
      </ChildShell>
    );
  }

  if (tahap === "muat") {
    return (
      <ChildShell tone="laut" back={false}>
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="anim-goyang">
            <Creature species={companion.species} mood="bingung" size={190} />
          </div>
          <p className="mt-4 font-judul text-2xl font-extrabold">
            {l(`${nama} sedang menyiapkan cerita`, `${nama} is getting a story ready`)}
          </p>
          <div className="mt-3 flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="anim-naik-turun size-3.5 rounded-full border-[3px] border-tinta bg-kunyit" style={{ animationDelay: `${i * 0.25}s` }} />
            ))}
          </div>
          <button type="button" className="mt-8 text-sm font-bold underline" onClick={() => { token.current++; setTahap("tema"); }}>
            {l("Batal", "Cancel")}
          </button>
        </div>
      </ChildShell>
    );
  }

  if (tahap === "adegan" && cerita) {
    return (
      <ChildShell tone="laut">
        <p className="flex flex-wrap items-center gap-2 font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">
          {cerita.judul}
          <span className="rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-[11px] normal-case tracking-normal">
            {cerita.ai ? l("Dibuat Gemini", "Made by Gemini") : l("Cerita pilihan", "Ready-made story")}
          </span>
        </p>
        <Say text={cerita.adegan} mood="bingung" size={110} quiet />
        <p className="mt-2 font-judul text-lg font-bold">{l("Berhenti sebentar, lalu pilih.", "Pause for a moment, then choose.")}</p>
        <ul className="stagger mt-2 grid gap-3">
          {cerita.pilihan.map((p) => (
            <li key={p.teks}>
              <button type="button" className="kartu w-full px-4 py-4 font-judul text-xl font-extrabold" onClick={() => pilih(p)}>
                {p.teks}
              </button>
            </li>
          ))}
        </ul>
      </ChildShell>
    );
  }

  const bijak = jawab && jawab.jenis !== "kurang";
  return (
    <ChildShell tone="laut" back={false}>
      {jawab && cerita && (
        <>
          <div className="anim-muncul mt-2 flex flex-col items-center rounded-[2rem] border-[3px] border-tinta bg-white p-4 shadow-[0_5px_0_var(--ink)]">
            <span className={bijak ? "anim-lompat inline-block" : "anim-getar inline-block"}>
              <Creature species={companion.species} mood={jawab.mood} size={150} />
            </span>
            <p className="mt-2 text-center text-xl font-bold leading-snug">{jawab.hasil}</p>
            <p className="mt-3 rounded-full border-2 border-tinta bg-kunyit-muda px-3 py-1 text-center text-sm font-extrabold">
              {l("Pelajaran: ", "Lesson: ")}
              {cerita.pelajaran}
            </p>
            <button type="button" className="mt-3 font-bold underline" onClick={() => speak(jawab.hasil)}>
              {l("Dengar lagi", "Listen again")}
            </button>
          </div>
          <p className="mt-2 text-center text-xs font-bold text-tinta-lembut">{l(`Bintangmu sekarang ${stars}`, `You now have ${stars} stars`)}</p>
          <div className="mt-4 grid gap-3">
            <button type="button" className="btn btn-karang text-xl" onClick={() => void buat(temaDipilih)}>
              {l("Cerita baru lagi", "Another new story")}
            </button>
            <button type="button" className="btn btn-putih" onClick={() => setTahap("tema")}>
              {l("Ganti tema", "Change theme")}
            </button>
            <Link href="/rumah" className="btn btn-putih">
              {l("Kembali ke rumah", "Back home")}
            </Link>
          </div>
        </>
      )}
    </ChildShell>
  );
}
