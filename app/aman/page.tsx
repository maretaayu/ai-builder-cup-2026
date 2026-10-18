"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AdultIcon, ADULTS, CheckIcon, type Adult } from "@/components/Icons";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { fx } from "@/lib/fx";
import { getar, sfx } from "@/lib/sfx";
import { actions, useHydrated, useStore, type After, type Body, type Level, type Weather } from "@/lib/store";
import { speak } from "@/lib/speech";
import { triage } from "@/lib/triage";
import { useT } from "@/lib/useT";
import type { Bahasa } from "@/lib/kamus";
import { translate } from "@/lib/kamus";
import { kirimSinyal, perbaruiSinyal } from "@/lib/ruang";
import { useSesi } from "@/lib/sesi";

type Cek = { weather: Weather; body: Body; after?: After };

/** Minta analisis (Gemini bila aktif) dan perbarui sinyal. Gagal pun tidak mengganggu anak. */
async function analisis(
  sinyalId: string,
  cek: Cek,
  semua: { ts: number; weather: Weather; body: Body; after?: After }[],
  lang: Bahasa,
  remote?: { kode: string; id: Promise<string | null> },
) {
  const nowMs = Date.now();
  try {
    const r = await fetch("/api/triase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang,
        sekarang: { hariLalu: 0, weather: cek.weather, body: cek.body, after: cek.after },
        riwayat: semua
          .filter((c) => nowMs - c.ts < 7 * 86_400_000)
          .map((c) => ({
            hariLalu: Math.floor((nowMs - c.ts) / 86_400_000),
            weather: c.weather,
            body: c.body,
            after: c.after,
          })),
      }),
    });
    if (!r.ok) return;
    const h = (await r.json()) as { level: Level; alasan: string; saran: string; ai: boolean };
    actions.updateSignal(sinyalId, { level: h.level, alasan: h.alasan, saran: h.saran, ai: h.ai });
    if (remote) {
      const rid = await remote.id;
      if (rid) await perbaruiSinyal(remote.kode, rid, { level: h.level, alasan: h.alasan, saran: h.saran, ai: h.ai }).catch(() => {});
    }
  } catch {
    // tetap pakai hasil aturan dasar
  }
}

function Aman() {
  const companion = useCompanion();
  const { t, lang } = useT();
  const sesi = useSesi();
  const params = useSearchParams();
  const dari = params.get("dari");
  const { circle, checkins } = useStore();
  const hydrated = useHydrated();
  // null = otomatis: pilih dulu bila lingkaran belum ada
  const [mode, setMode] = useState<boolean | null>(null);
  const memilih = mode ?? circle.length === 0;
  const [dipilih, setDipilih] = useState<string[]>([]);
  const [kepada, setKepada] = useState<string | null>(null);

  if (!companion || !hydrated) return null;

  function toggle(id: string) {
    setDipilih((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 3 ? [...cur, id] : cur));
  }

  function simpan() {
    actions.setCircle(dipilih);
    actions.addStar(1, "aman");
    setMode(false);
  }

  function kirim(id: string) {
    const cek = checkins.find((c) => c.id === dari) ?? checkins[checkins.length - 1];
    const tr = cek ? triage({ weather: cek.weather, body: cek.body, after: cek.after }, lang) : undefined;
    const level = tr && tr.level !== "aman" ? tr.level : "perhatian";
    const alasan = tr && tr.level !== "aman" ? tr.alasan : translate(lang, "triase.minta");
    const sinyalId = actions.sendSignal({ to: id, weather: cek?.weather, body: cek?.body, level, alasan });
    // Perangkat anak yang terhubung ke sebuah ruang juga mengirim sinyal ke Firestore.
    const kodeRuang = sesi.user?.anonim ? sesi.profil?.ruangKode : undefined;
    const remote = kodeRuang
      ? {
          kode: kodeRuang,
          id: kirimSinyal(kodeRuang, { to: id, weather: cek?.weather, body: cek?.body, level, alasan, nama: companion?.name }).catch(() => null),
        }
      : undefined;
    if (cek) void analisis(sinyalId, cek, checkins, lang, remote);
    setKepada(id);
    sfx.ding();
    getar([40, 60, 40]);
    fx.rayakan();
    speak(t("aman.speak.terkirim"));
  }

  if (kepada) {
    const label = t(`dewasa.${kepada as Adult}`);
    return (
      <ChildShell tone="kunyit" back={false}>
        <div className="anim-pop mt-2 flex flex-col items-center rounded-[2rem] border-[4px] border-tinta bg-white p-5 text-center shadow-[0_6px_0_var(--ink)]">
          <AdultIcon id={kepada as Adult} size={96} />
          <p className="mt-2 font-judul text-lg font-bold text-tinta-lembut">{t("aman.kartu.untuk", { label })}</p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight">
            {t("aman.kartu.isi")}
          </h1>
          <p className="mt-3 text-base font-semibold text-tinta-lembut">{t("aman.kartu.tunjuk")}</p>
        </div>
        <Link href="/rumah" className="btn btn-putih mt-6 w-full">
          {t("umum.selesai")}
        </Link>
      </ChildShell>
    );
  }

  if (memilih) {
    return (
      <ChildShell tone="kunyit">
        <Say text={t("aman.pilih")} mood="senang" size={110} />
        <ul className="stagger mt-4 grid grid-cols-2 gap-3">
          {ADULTS.map((a) => {
            const on = dipilih.includes(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  className="kartu relative flex w-full flex-col items-center gap-1 px-2 py-3"
                  aria-pressed={on}
                  onClick={() => {
                    toggle(a.id);
                    speak(t(`dewasa.${a.id}`));
                  }}
                >
                  <AdultIcon id={a.id} size={72} />
                  <span className="font-judul text-lg font-extrabold">{t(`dewasa.${a.id}`)}</span>
                  {on && (
                    <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full border-[3px] border-tinta bg-daun">
                      <CheckIcon size={16} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          disabled={dipilih.length === 0}
          className="btn btn-laut mt-6 w-full text-2xl disabled:opacity-40"
          onClick={simpan}
        >
          {t("aman.simpan")}
        </button>
      </ChildShell>
    );
  }

  return (
    <ChildShell tone="kunyit">
      <Say
        text={dari ? t("aman.minta") : t("aman.lingkaran")}
        mood="tenang"
        size={110}
      />
      <ul className="stagger mt-4 grid gap-3">
        {circle.map((id) => {
          const a = ADULTS.find((x) => x.id === id);
          if (!a) return null;
          return (
            <li key={id}>
              <button type="button" className="kartu flex w-full items-center gap-3 p-3" onClick={() => kirim(id)}>
                <AdultIcon id={a.id} size={64} />
                <span className="flex-1">
                  <span className="block font-judul text-2xl font-extrabold">{t(`dewasa.${a.id}`)}</span>
                  <span className="block text-sm font-bold text-tinta-lembut">{t("aman.sentuh")}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="mt-5 self-center font-bold underline" onClick={() => {
          setDipilih(circle);
          setMode(true);
        }}>
        {t("aman.ganti")}
      </button>
    </ChildShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Aman />
    </Suspense>
  );
}
