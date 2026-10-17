"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { actions, useHydrated, useStore } from "@/lib/store";
import { speak, useSay } from "@/lib/speech";
import { useT } from "@/lib/useT";
import { LangSwitch } from "./LangSwitch";
import { Creature, type Mood } from "./Creature";
import { ArrowLeftIcon, SpeakerIcon, StarIcon } from "./Icons";

/** Pastikan anak sudah punya teman; kalau belum, arahkan ke adopsi. */
export function useCompanion() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { companion } = useStore();
  useEffect(() => {
    if (hydrated && !companion) router.replace("/adopsi");
  }, [hydrated, companion, router]);
  return companion;
}

function PenghitungBintang() {
  const { stars } = useStore();
  const { t } = useT();
  const [pop, setPop] = useState(0);

  useEffect(() => {
    const on = () => setPop((n) => n + 1);
    window.addEventListener("rr:bintang-tiba", on);
    return () => window.removeEventListener("rr:bintang-tiba", on);
  }, []);

  return (
    <div
      id="hitung-bintang"
      className="flex items-center gap-1.5 rounded-full border-[3px] border-tinta bg-white px-3 py-1 font-judul text-lg font-bold"
      aria-label={t("umum.bintangN", { n: stars })}
    >
      <span key={pop} className={`inline-flex ${pop ? "anim-hitung" : ""}`}>
        <StarIcon size={22} />
      </span>
      {stars}
    </div>
  );
}

export function ChildShell({
  children,
  back = "/rumah",
  tone = "krem",
}: {
  children: ReactNode;
  back?: string | false;
  tone?: "krem" | "langit" | "kunyit" | "laut";
}) {
  const { sound } = useStore();
  const { t } = useT();
  const bg = {
    krem: "bg-krem",
    langit: "bg-langit",
    kunyit: "bg-kunyit-muda",
    laut: "bg-laut-muda",
  }[tone];
  return (
    <div className={`flex min-h-dvh flex-1 flex-col transition-colors duration-1000 ${bg}`}>
      <header className="flex items-center justify-between gap-3 px-4 pt-4">
        {back ? (
          <Link href={back} className="btn btn-putih btn-kecil" aria-label={t("umum.kembali")}>
            <ArrowLeftIcon size={22} />
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <LangSwitch />
          <PenghitungBintang />
          <button
            type="button"
            className="btn btn-putih btn-kecil"
            onClick={() => actions.toggleSound()}
            aria-pressed={sound}
            aria-label={sound ? t("umum.suaraMati") : t("umum.suaraNyala")}
          >
            <SpeakerIcon size={22} off={!sound} />
          </button>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-4 pb-8 pt-3">{children}</main>
    </div>
  );
}

/** Teman bicara: maskot + gelembung ucapan yang juga dibacakan. Maskot bisa disentuh. */
export function Say({
  text,
  mood = "senang",
  size = 112,
  quiet = false,
  pulse = 0,
}: {
  text: string;
  mood?: Mood;
  size?: number;
  quiet?: boolean;
  /** 0..1, membuat maskot mengembang pelan (misalnya saat berlatih napas) */
  pulse?: number;
}) {
  const companion = useStore().companion;
  const { t } = useT();
  useSay(quiet ? undefined : text);
  if (!companion) return null;
  return (
    <div className="anim-muncul flex items-end gap-1">
      <div
        className="anim-naik-turun shrink-0 transition-transform duration-150"
        style={{ transform: `scale(${1 + pulse * 0.14})`, transformOrigin: "50% 100%" }}
      >
        <Creature species={companion.species} mood={mood} size={size} label={companion.name} sentuh />
      </div>
      <div className="relative mb-4 flex-1 rounded-3xl border-[3px] border-tinta bg-white px-4 py-3 shadow-[0_4px_0_var(--ink)]">
        <span
          aria-hidden
          className="absolute -left-[11px] bottom-5 h-4 w-4 rotate-45 border-b-[3px] border-l-[3px] border-tinta bg-white"
        />
        <p className="text-[1.15rem] font-bold leading-snug">{text}</p>
        <button
          type="button"
          onClick={() => speak(text)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-tinta bg-laut-muda px-3 py-1 text-sm font-bold"
          aria-label={t("umum.dengarLagi")}
        >
          <SpeakerIcon size={18} />
          {t("umum.dengarLagi")}
        </button>
      </div>
    </div>
  );
}

export function Stamp({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border-[3px] border-tinta bg-white px-3 py-1 font-judul text-sm font-bold uppercase tracking-wide">
      {children}
    </span>
  );
}
