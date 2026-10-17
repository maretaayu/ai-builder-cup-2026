"use client";

import Link from "next/link";
import { useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { fx } from "@/lib/fx";
import type { Kunci } from "@/lib/kamus";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";
import { speak } from "@/lib/speech";
import { useT } from "@/lib/useT";

type Pilihan = { teks: Kunci; hasil: Kunci; bijak: boolean; mood: Mood };
type Adegan = { latar: Kunci; cerita: Kunci; pilihan: Pilihan[] };

const CERITA: Adegan[] = [
  {
    latar: "cerita.s1.latar",
    cerita: "cerita.s1.cerita",
    pilihan: [
      { teks: "cerita.s1.p1.teks", hasil: "cerita.s1.p1.hasil", bijak: true, mood: "tenang" },
      { teks: "cerita.s1.p2.teks", hasil: "cerita.s1.p2.hasil", bijak: true, mood: "senang" },
      { teks: "cerita.s1.p3.teks", hasil: "cerita.s1.p3.hasil", bijak: false, mood: "marah" },
    ],
  },
  {
    latar: "cerita.s2.latar",
    cerita: "cerita.s2.cerita",
    pilihan: [
      { teks: "cerita.s2.p1.teks", hasil: "cerita.s2.p1.hasil", bijak: true, mood: "senang" },
      { teks: "cerita.s2.p2.teks", hasil: "cerita.s2.p2.hasil", bijak: true, mood: "tenang" },
      { teks: "cerita.s2.p3.teks", hasil: "cerita.s2.p3.hasil", bijak: false, mood: "sedih" },
    ],
  },
];

export default function Cerita() {
  const companion = useCompanion();
  const { t } = useT();
  const [n, setN] = useState(0);
  const [jawab, setJawab] = useState<Pilihan | null>(null);
  const [bijak, setBijak] = useState(0);

  if (!companion) return null;
  const nama = companion.name;
  const adegan = CERITA[Math.min(n, CERITA.length - 1)];
  const selesai = n >= CERITA.length;

  function pilih(p: Pilihan) {
    setJawab(p);
    if (p.bijak) {
      setBijak((b) => b + 1);
      sfx.benar();
    } else {
      sfx.salah();
    }
    speak(t(p.hasil, { n: nama }));
  }

  function lanjut() {
    const next = n + 1;
    setJawab(null);
    setN(next);
    if (next >= CERITA.length) {
      actions.addStar(1 + bijak);
      fx.rayakan();
    }
  }

  if (selesai) {
    return (
      <ChildShell tone="laut" back="/rumah">
        <Say text={t("cerita.selesai", { n: nama })} mood="senang" size={130} />
        <Link href="/rumah" className="btn btn-laut mt-6 w-full text-2xl">
          {t("umum.kembaliRumah")}
        </Link>
      </ChildShell>
    );
  }

  if (jawab) {
    const teksHasil = t(jawab.hasil, { n: nama });
    return (
      <ChildShell tone="laut" back={false}>
        <div className="anim-muncul mt-2 flex flex-col items-center rounded-[2rem] border-[3px] border-tinta bg-white p-4 shadow-[0_5px_0_var(--ink)]">
          <span className={jawab.bijak ? "anim-lompat inline-block" : "anim-getar inline-block"}>
            <Creature species={companion.species} mood={jawab.mood} size={150} />
          </span>
          <p className="mt-2 text-center text-xl font-bold leading-snug">{teksHasil}</p>
          <button type="button" className="mt-3 font-bold underline" onClick={() => speak(teksHasil)}>
            {t("umum.dengarLagi")}
          </button>
        </div>
        <button type="button" className="btn btn-karang mt-6 w-full text-2xl" onClick={lanjut}>
          {n + 1 >= CERITA.length ? t("umum.selesai") : t("cerita.berikut")}
        </button>
      </ChildShell>
    );
  }

  return (
    <ChildShell tone="laut">
      <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">{t(adegan.latar)}</p>
      <Say text={t(adegan.cerita, { n: nama })} mood="bingung" size={110} />
      <p className="mt-2 font-judul text-lg font-bold">{t("cerita.jeda")}</p>
      <ul className="stagger mt-2 grid gap-3">
        {adegan.pilihan.map((p) => (
          <li key={p.teks}>
            <button type="button" className="kartu w-full px-4 py-4 font-judul text-xl font-extrabold" onClick={() => pilih(p)}>
              {t(p.teks)}
            </button>
          </li>
        ))}
      </ul>
    </ChildShell>
  );
}
