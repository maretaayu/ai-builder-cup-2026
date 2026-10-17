"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BalloonIcon, BookIcon, FaceIcon, HeartHandsIcon, StarIcon, WeatherIcon } from "@/components/Icons";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/useT";

function Tile({
  href,
  title,
  sub,
  icon,
  tone,
  ai = false,
}: {
  href: string;
  title: string;
  sub: string;
  icon: ReactNode;
  tone: string;
  ai?: boolean;
}) {
  return (
    <Link href={href} className="kartu flex items-center gap-3 p-3" style={{ background: tone }}>
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-[3px] border-tinta bg-white">
        {icon}
      </span>
      <span>
        <span className="flex items-center gap-2 font-judul text-2xl font-extrabold leading-none">
          {title}
          {ai && <span className="rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-[11px] font-extrabold tracking-wide">AI</span>}
        </span>
        <span className="mt-1 block text-sm font-bold text-tinta-lembut">{sub}</span>
      </span>
    </Link>
  );
}

function Pohon({ bintang, aria }: { bintang: number; aria: string }) {
  const buah = Math.min(bintang, 8);
  // posisi buah dalam persen di area tajuk pohon
  const pos: [number, number][] = [
    [30, 26], [50, 14], [70, 28], [38, 46], [62, 44], [22, 44], [78, 46], [50, 34],
  ];
  return (
    <div className="anim-pohon relative size-36 shrink-0" role="img" aria-label={aria}>
      <Image src="/img/pohon.webp" width={512} height={512} unoptimized alt="" aria-hidden draggable={false} className="size-full object-contain" />
      {pos.slice(0, buah).map(([x, y], i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <span className="anim-pop inline-flex">
            <span className="anim-kilau inline-flex" style={{ animationDelay: `${(i * 330) % 2600}ms` }}>
              <StarIcon size={24} />
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Rumah() {
  const companion = useCompanion();
  const { checkins, stars } = useStore();
  const { t, lang } = useT();
  if (!companion) return null;

  const today = new Date().toDateString();
  const sudah = checkins.some((c) => new Date(c.ts).toDateString() === today);
  const sapa = sudah
    ? t("rumah.sapaLagi", { nama: companion.name })
    : t("rumah.sapaBaru", { nama: companion.name });

  return (
    <ChildShell back="/anak" tone="langit">
      <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-tinta shadow-[0_5px_0_var(--ink)]">
        <Image
          src="/img/latar-rumah.webp"
          width={1200}
          height={800}
          unoptimized
          priority
          alt=""
          aria-hidden
          className="anim-geser absolute inset-0 size-full object-cover"
        />
        <div className="relative px-3 pb-1 pt-14">
          <Say text={sapa} mood="senang" size={120} />
        </div>
      </div>

      {!sudah && (
        <Link href="/cuaca" className="btn btn-karang mt-3 w-full text-2xl">
          <span className="flex -space-x-2">
            <WeatherIcon weather="cerah" size={36} />
            <WeatherIcon weather="hujan" size={36} />
          </span>
          {t("rumah.cekCuaca")}
        </Link>
      )}

      <div className="stagger mt-5 grid gap-3">
        <Tile href="/napas" title={t("rumah.p3k.judul")} sub={t("rumah.p3k.sub")} tone="#fbd3cc" icon={<BalloonIcon size={44} />} />
        <Tile href="/tebak" title={t("rumah.tebak.judul")} sub={t("rumah.tebak.sub")} tone="#fde7ad" icon={<FaceIcon size={44} />} />
        <Tile href="/cerita" title={t("rumah.cerita.judul")} sub={t("rumah.cerita.sub", { nama: companion.name })} tone="#cdeeea" icon={<BookIcon size={44} />} />
        <Tile href="/cerita-ajaib" title={lang === "en" ? "Magic Story" : "Cerita Ajaib"} sub={lang === "en" ? "A new story just for you" : "Cerita baru, buatan AI"} tone="#fde7ad" icon={<StarIcon size={44} />} ai />
        <Tile href="/tanya-boni" title={lang === "en" ? `Ask ${companion.name}` : `Tanya ${companion.name}`} sub={lang === "en" ? "Ask about your feelings" : "Tanya tentang perasaan"} tone="#cdeeea" icon={<FaceIcon size={44} />} ai />
        <Tile href="/aman" title={t("rumah.aman.judul")} sub={t("rumah.aman.sub")} tone="#e3e0f5" icon={<HeartHandsIcon size={44} />} />
      </div>

      <section className="mt-6 flex items-center gap-2 rounded-3xl border-[3px] border-tinta bg-white p-3 shadow-[0_5px_0_var(--ink)]">
        <Pohon bintang={stars} aria={t("rumah.pohon.aria", { n: Math.min(stars, 8) })} />
        <div>
          <h2 className="font-judul text-2xl font-extrabold">{t("rumah.pohon.judul")}</h2>
          <p className="mt-1 flex items-center gap-1 text-base font-bold text-tinta-lembut">
            <StarIcon size={20} /> {t("umum.bintangN", { n: stars })}
          </p>
          <p className="mt-1 text-sm font-semibold text-tinta-lembut">{t("rumah.pohon.desc")}</p>
        </div>
      </section>
    </ChildShell>
  );
}
