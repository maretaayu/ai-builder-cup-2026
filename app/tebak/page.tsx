"use client";

import Link from "next/link";
import { useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { CheckIcon, StarIcon } from "@/components/Icons";
import { ChildShell, useCompanion } from "@/components/ui";
import { fx } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { actions, type Species } from "@/lib/store";
import { speak, useSay } from "@/lib/speech";
import { useT } from "@/lib/useT";

const PILIHAN: Mood[] = ["senang", "sedih", "marah", "bingung"];

const RONDE = 5;
const SOAL: { mood: Mood; species: Species }[] = [
  { mood: "senang", species: "penyu" },
  { mood: "sedih", species: "nuri" },
  { mood: "marah", species: "badak" },
  { mood: "bingung", species: "penyu" },
  { mood: "sedih", species: "badak" },
];

export default function Tebak() {
  const companion = useCompanion();
  const { t } = useT();

  const [i, setI] = useState(0);
  const [pilih, setPilih] = useState<Mood | null>(null);
  const [benar, setBenar] = useState(0);
  const selesai = i >= RONDE;

  const ronde = SOAL[Math.min(i, RONDE - 1)];
  const tanya = t("tebak.tanya");
  useSay(selesai ? undefined : tanya);

  if (!companion) return null;

  function jawab(m: Mood) {
    if (pilih) return;
    setPilih(m);
    const ok = m === ronde.mood;
    const skor = benar + (ok ? 1 : 0);
    const kata = t(`mood.${ronde.mood}`).toLowerCase();
    if (ok) {
      setBenar(skor);
      sfx.benar();
      speak(t("tebak.betul", { kata }));
    } else {
      sfx.salah();
      speak(t("tebak.hampir", { kata }));
    }
    window.setTimeout(() => {
      setPilih(null);
      const n = i + 1;
      setI(n);
      if (n >= RONDE) {
        actions.addStar(Math.max(1, skor), "tebak");
        fx.rayakan();
      }
    }, 1700);
  }

  if (selesai) {
    return (
      <ChildShell tone="kunyit" back="/rumah">
        <div className="anim-muncul mt-6 flex flex-col items-center text-center">
          <Creature species={companion.species} mood="senang" size={180} className="anim-goyang" sentuh />
          <h1 className="mt-4 text-4xl font-extrabold">{t("tebak.judulHasil")}</h1>
          <p className="mt-2 text-xl font-bold">
            {t("tebak.skor", { n: benar, total: RONDE })}
          </p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {Array.from({ length: RONDE }).map((_, k) => (
              <span key={k} className="anim-pop inline-flex" style={{ animationDelay: `${k * 110}ms` }}>
                <StarIcon size={36} filled={k < benar} />
              </span>
            ))}
          </div>
          <Link href="/rumah" className="btn btn-laut mt-8 w-full text-2xl">
            {t("umum.kembaliRumah")}
          </Link>
        </div>
      </ChildShell>
    );
  }

  const jawabBenar = pilih !== null && pilih === ronde.mood;

  return (
    <ChildShell tone="kunyit">
      <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">
        {t("tebak.ronde", { i: i + 1, n: RONDE })}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold">{tanya}</h1>

      <div className="relative mt-3 grid place-items-center rounded-[2rem] border-[3px] border-tinta bg-krem py-3 shadow-[0_5px_0_var(--ink)]">
        <div key={i} className="anim-muncul">
          <span className={jawabBenar ? "anim-lompat inline-block" : "inline-block"}>
            <Creature species={ronde.species} mood={ronde.mood} size={190} />
          </span>
        </div>
      </div>

      <ul className="stagger mt-5 grid grid-cols-2 gap-3" key={`p${i}`}>
        {PILIHAN.map((p) => {
          const terpilih = pilih === p;
          const kunci = pilih !== null;
          const betul = kunci && p === ronde.mood;
          const salah = terpilih && !betul;
          return (
            <li key={p}>
              <button
                type="button"
                disabled={kunci}
                aria-pressed={terpilih}
                onClick={() => jawab(p)}
                className={`kartu flex w-full items-center justify-center gap-2 px-2 py-4 font-judul text-2xl font-extrabold disabled:cursor-default ${
                  betul ? "anim-pop !bg-daun" : salah ? "anim-getar !bg-karang-muda" : ""
                }`}
              >
                {betul && <CheckIcon size={26} />}
                {t(`mood.${p}`)}
              </button>
            </li>
          );
        })}
      </ul>
    </ChildShell>
  );
}
