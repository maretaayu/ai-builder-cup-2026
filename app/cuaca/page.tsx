"use client";

import Link from "next/link";
import { useState } from "react";
import type { Mood } from "@/components/Creature";
import { BodyIcon, WeatherIcon, type BodyPart } from "@/components/Icons";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { actions, type Body, type Weather } from "@/lib/store";
import { speak } from "@/lib/speech";
import { catatCekin } from "@/lib/ruang";
import { useSesi } from "@/lib/sesi";
import { triage } from "@/lib/triage";
import { useT } from "@/lib/useT";

const WEATHERS: { id: Weather; mood: Mood; tone: string }[] = [
  { id: "cerah", mood: "senang", tone: "#fde7ad" },
  { id: "mendung", mood: "bingung", tone: "#e7edf5" },
  { id: "hujan", mood: "sedih", tone: "#d6e6f5" },
  { id: "badai", mood: "marah", tone: "#d9d3ea" },
];

const BODIES: BodyPart[] = ["kepala", "dada", "perut", "tangan"];

type Hasil = { weather: Weather; body: Body; level: "aman" | "perhatian" | "segera"; checkinId: string };

export default function Cuaca() {
  const companion = useCompanion();
  const { t, lang } = useT();
  const sesi = useSesi();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [lihat, setLihat] = useState<Mood | null>(null);

  if (!companion) return null;

  function pilihBadan(body: Body) {
    if (!weather) return;
    const tr = triage({ weather, body }, lang);
    const id = actions.addCheckin({ weather, body, level: tr.level });
    actions.addStar(1, "cuaca");
    if (sesi.user?.anonim && sesi.profil?.ruangKode) void catatCekin(sesi.profil.ruangKode, { weather, body, level: tr.level }).catch(() => {});
    setHasil({ weather, body, level: tr.level, checkinId: id });
  }

  const mood = WEATHERS.find((w) => w.id === (hasil?.weather ?? weather))?.mood ?? "senang";

  if (hasil) {
    const berat = hasil.weather === "badai" || hasil.weather === "hujan";
    const ucap = berat
      ? t("cuaca.hasil.berat")
      : hasil.weather === "mendung"
        ? t("cuaca.hasil.mendung")
        : t("cuaca.hasil.cerah");
    return (
      <ChildShell tone="langit">
        <Say text={ucap} mood={berat ? "tenang" : mood} size={130} />
        <div className="anim-muncul mt-4 grid gap-4">
          {berat ? (
            <Link href={`/napas?cek=${hasil.checkinId}`} className="btn btn-karang text-2xl">
              {t("cuaca.btn.tenang")}
            </Link>
          ) : hasil.weather === "mendung" ? (
            <Link href="/tebak" className="btn btn-laut text-2xl">
              {t("cuaca.btn.tebak")}
            </Link>
          ) : (
            <Link href="/cerita" className="btn btn-laut text-2xl">
              {t("cuaca.btn.cerita")}
            </Link>
          )}
          <Link href="/rumah" className="btn btn-putih">
            {t("umum.kembaliRumah")}
          </Link>
        </div>
      </ChildShell>
    );
  }

  if (!weather) {
    return (
      <ChildShell tone="langit">
        <Say text={t("cuaca.tanya1")} mood={lihat ?? "senang"} size={110} />
        <ul className="stagger mt-4 grid grid-cols-2 gap-3">
          {WEATHERS.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                className="kartu flex h-full w-full flex-col items-center gap-1 px-2 py-4"
                style={{ background: w.tone }}
                onPointerEnter={() => setLihat(w.mood)}
                onPointerDown={() => setLihat(w.mood)}
                onFocus={() => setLihat(w.mood)}
                onPointerLeave={() => setLihat(null)}
                onBlur={() => setLihat(null)}
                onClick={() => {
                  setWeather(w.id);
                  speak(t(`cuaca.ucap.${w.id}`));
                }}
              >
                <WeatherIcon weather={w.id} size={84} animated />
                <span className="font-judul text-2xl font-extrabold">{t(`cuaca.${w.id}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </ChildShell>
    );
  }

  return (
    <ChildShell tone="langit" back={false}>
      <Say text={t("cuaca.tanya2")} mood={mood} size={110} />
      <ul className="stagger mt-4 grid grid-cols-2 gap-3">
        {BODIES.map((b) => (
          <li key={b}>
            <button
              type="button"
              className="kartu flex w-full flex-col items-center gap-1 bg-white px-2 py-3"
              onClick={() => {
                speak(t(`badan.${b}`));
                pilihBadan(b);
              }}
            >
              <BodyIcon part={b} size={72} />
              <span className="font-judul text-xl font-extrabold">{t(`badan.${b}`)}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-putih mt-4 w-full" onClick={() => pilihBadan("tidak")}>
        {t("badan.tidak")}
      </button>
      <button type="button" className="mt-4 self-center font-bold underline" onClick={() => setWeather(null)}>
        {t("cuaca.ganti")}
      </button>
    </ChildShell>
  );
}
