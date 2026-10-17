"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { useStore, type Species } from "@/lib/store";
import { useT } from "@/lib/useT";

export type Mood = "senang" | "sedih" | "marah" | "bingung" | "tenang";

const MOODS: Mood[] = ["senang", "sedih", "marah", "bingung", "tenang"];

export const NAMA_PILIHAN: Record<Species, string[]> = {
  badak: ["Boni", "Bimo", "Badu"],
  nuri: ["Nuri", "Kiki", "Mera"],
  penyu: ["Peyu", "Tulus", "Lani"],
};

const KATA_SENTUH = ["sentuh.1", "sentuh.2", "sentuh.3", "sentuh.4"] as const;

/**
 * Karakter dengan semua ekspresi ditumpuk dan berganti halus (crossfade).
 * Berkedip sesekali saat senang; bila `sentuh`, bisa disentuh untuk memantul dan menyapa.
 */
export function Creature({
  species,
  mood = "senang",
  size = 160,
  className = "",
  label,
  sentuh = false,
}: {
  species: Species;
  mood?: Mood;
  size?: number;
  className?: string;
  label?: string;
  sentuh?: boolean;
}) {
  const { sound } = useStore();
  const { t } = useT();
  const [kedip, setKedip] = useState(false);
  const [pantul, setPantul] = useState(0);

  useEffect(() => {
    if (mood !== "senang") return;
    let t = 0;
    const jadwal = () => {
      t = window.setTimeout(() => {
        setKedip(true);
        t = window.setTimeout(() => {
          setKedip(false);
          jadwal();
        }, 150);
      }, 2500 + Math.random() * 3500);
    };
    jadwal();
    return () => window.clearTimeout(t);
  }, [mood]);

  const aktif: Mood = kedip && mood === "senang" ? "tenang" : mood;

  const gambar = (
    <span key={pantul} className={`relative block ${pantul ? "anim-pantul" : ""}`} style={{ width: size, height: size }}>
      {MOODS.map((m) => (
        <Image
          key={m}
          src={`/img/${species}-${m}.webp`}
          width={512}
          height={512}
          unoptimized
          loading="eager"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 size-full select-none object-contain transition-opacity duration-150"
          style={{ opacity: m === aktif ? 1 : 0 }}
        />
      ))}
    </span>
  );

  if (!sentuh) {
    return (
      <span
        className={`inline-block ${className}`}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        {gambar}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`inline-block cursor-pointer touch-manipulation ${className}`}
      aria-label={label ? t("sentuh.aria", { nama: label }) : t("sentuh.ariaUmum")}
      onClick={() => {
        sfx.pop();
        setPantul((n) => n + 1);
        if (sound) speak(t(KATA_SENTUH[pantul % KATA_SENTUH.length]));
      }}
    >
      {gambar}
    </button>
  );
}
