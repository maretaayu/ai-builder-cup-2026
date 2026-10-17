"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { AdultIcon, WeatherIcon } from "@/components/Icons";
import { Ikon } from "@/components/lms/ikon";
import { useL } from "@/components/lms/util";
import { KORPUS } from "@/lib/copilot";
import { translate } from "@/lib/kamus";
import type { Weather } from "@/lib/store";
import { useScrollY } from "./hooks";

const CUACA: { id: Weather; mood: Mood }[] = [
  { id: "cerah", mood: "senang" },
  { id: "mendung", mood: "bingung" },
  { id: "hujan", mood: "sedih" },
  { id: "badai", mood: "marah" },
];

export function Hero() {
  const { l, lang } = useL();
  const y = useScrollY();
  const [pilih, setPilih] = useState<Weather | null>(null);
  const panggung = useRef<HTMLDivElement>(null);

  const mood: Mood = CUACA.find((c) => c.id === pilih)?.mood ?? "senang";
  const berat = pilih === "hujan" || pilih === "badai";
  const saran = KORPUS.find((e) => e.id === "sinyal")!.isi[lang].langkah[0];

  // Maskot sedikit "menoleh" mengikuti kursor
  function gerak(e: React.PointerEvent<HTMLDivElement>) {
    const el = panggung.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  }

  return (
    <section className="relative isolate overflow-hidden" onPointerMove={gerak}>
      {/* Latar pulau dengan paralaks */}
      <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden>
        <Image
          src="/img/latar-rumah.webp"
          width={1200}
          height={800}
          unoptimized
          priority
          alt=""
          className="absolute left-0 top-0 h-[115%] w-full object-cover"
          style={{ transform: `translateY(${y * 0.22}px) scale(1.04)` }}
        />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-white/95 via-white/70 to-white/0 md:from-white/95 md:via-white/60" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-white to-white/0" />

      {/* Awan cuaca melayang */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
        <span className="anim-mengambang absolute left-[52%] top-24 opacity-90" style={{ animationDelay: "-1s" }}>
          <WeatherIcon weather="cerah" size={64} animated />
        </span>
        <span className="anim-mengambang absolute right-[8%] top-40 opacity-90" style={{ animationDelay: "-3s" }}>
          <WeatherIcon weather="mendung" size={72} animated />
        </span>
        <span className="anim-mengambang absolute right-[34%] top-[20%] opacity-80" style={{ animationDelay: "-2s" }}>
          <WeatherIcon weather="hujan" size={56} animated />
        </span>
      </div>

      <div className="mx-auto grid min-h-[100svh] w-full max-w-7xl items-center gap-6 px-5 pb-10 pt-24 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pt-20">
        <div>
          <span className="anim-terbit inline-flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-1.5 text-xs font-bold text-biru shadow-sm backdrop-blur">
            <Ikon nama="sparkle" size={14} />
            {l("Prototipe Google Cloud AI Builder Cup 2026", "Google Cloud AI Builder Cup 2026 prototype")}
          </span>
          <h1 className="tampil anim-terbit mt-5 text-[clamp(2.6rem,5.6vw,4.9rem)] font-extrabold text-tinta" style={{ animationDelay: "120ms" }}>
            {l("Perasaan anak", "Every child's")}
            <br />
            <span className="text-karang">{l("pantas didengar.", "feelings deserve to be heard.")}</span>
          </h1>
          <p className="anim-terbit mt-4 max-w-xl text-base font-medium leading-relaxed text-tinta/80 md:text-lg" style={{ animationDelay: "240ms" }}>
            {l(
              "Ruang Rasa mengajak anak SD mengenali dan menenangkan perasaannya, memberi tanda kepada orang dewasa yang ia percaya, lalu melatih guru untuk menjawabnya. AI memperluas jangkauan tenaga ahli yang terbatas, bukan menggantikannya.",
              "Ruang Rasa helps primary-school children notice and calm their feelings, signal a trusted adult, and trains teachers to respond. AI extends the reach of scarce experts instead of replacing them.",
            )}
          </p>

          <div className="anim-terbit mt-6 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
            <Link href="/anak" className="inline-flex items-center gap-2 rounded-full bg-karang px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_28px_rgba(239,111,94,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(239,111,94,0.55)]">
              {l("Coba aplikasi anak", "Try the child app")}
              <Ikon nama="arrow" size={18} />
            </Link>
            <Link href="/akademi" className="inline-flex items-center gap-2 rounded-full border-2 border-tinta/15 bg-white/80 px-6 py-3 text-base font-bold text-tinta backdrop-blur transition hover:bg-white">
              Baku Jaga Academy
            </Link>
          </div>

          {/* Demo interaktif */}
          <div className="anim-terbit mt-6 max-w-xl rounded-[1.75rem] bg-white/85 p-4 shadow-[0_18px_50px_rgba(30,42,74,0.14)] backdrop-blur-md md:p-5" style={{ animationDelay: "480ms" }}>
            <p className="text-sm font-bold text-tinta">
              {l("Coba sendiri: seperti apa cuaca di hatimu hari ini?", "Try it: what's the weather in your heart today?")}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {CUACA.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={pilih === c.id}
                  onClick={() => setPilih(c.id)}
                  className={`group flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2.5 text-xs font-bold transition ${
                    pilih === c.id ? "border-karang bg-karang-muda" : "border-transparent bg-white hover:border-tinta/15 hover:bg-krem"
                  }`}
                >
                  <span className="transition-transform group-hover:scale-110">
                    <WeatherIcon weather={c.id} size={38} animated />
                  </span>
                  {translate(lang, `cuaca.${c.id}`)}
                </button>
              ))}
            </div>

            <div className="mt-3 min-h-[84px]" aria-live="polite">
              {!pilih && (
                <p className="rounded-xl bg-krem px-4 py-3 text-sm font-medium text-tinta/70">
                  {l("Pilih satu dan lihat apa yang terjadi di sisi orang dewasa.", "Pick one and see what happens on the adult's side.")}
                </p>
              )}
              {pilih && (
                <div key={pilih} className="anim-terbit flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-tinta/10">
                  <AdultIcon id="ibu" size={44} />
                  <div className="text-sm">
                    <p className="flex flex-wrap items-center gap-2 font-bold">
                      {berat ? l("Sinyal untuk Ibu", "Signal for Mom") : l("Tercatat di ruang dampingan", "Logged in the support room")}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${berat ? "bg-kunyit-muda text-kuning" : "bg-hijau-muda text-hijau"}`}>
                        {berat ? l("Perlu perhatian", "Needs attention") : l("Aman", "Okay")}
                      </span>
                    </p>
                    <p className="mt-1 font-medium leading-relaxed text-tinta/80">
                      {berat ? saran : translate(lang, "triase.aman")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panggung maskot */}
        <div className="relative mx-auto flex h-[420px] w-full max-w-xl items-center justify-center md:h-[560px]">
          <div
            key={pilih ?? "awal"}
            className="anim-terbit absolute left-1/2 top-2 z-20 w-64 -translate-x-1/2 rounded-3xl bg-white px-5 py-3 text-center text-base font-bold shadow-[0_12px_30px_rgba(30,42,74,0.18)] md:top-6"
          >
            {pilih ? translate(lang, `cuaca.ucap.${pilih}`) : l("Hai! Sentuh aku, ya.", "Hi! Tap me.")}
            <span aria-hidden className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-white" />
          </div>
          <div
            ref={panggung}
            className="relative flex items-end justify-center transition-transform duration-300 [transform:translate(calc(var(--mx,0)*10px),calc(var(--my,0)*6px))]"
          >
            <Creature species="penyu" mood={mood} size={190} sentuh className="-mr-10 mb-1 anim-naik-turun" label="Penyu" />
            <Creature species="badak" mood={mood} size={300} sentuh className="relative z-10 anim-goyang" label="Badak" />
            <Creature species="nuri" mood={mood} size={190} sentuh className="-ml-10 mb-1 anim-naik-turun" label="Nuri" />
          </div>
        </div>
      </div>
    </section>
  );
}
