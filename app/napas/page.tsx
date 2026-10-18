"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BalloonIcon } from "@/components/Icons";
import { ChildShell, Say, useCompanion } from "@/components/ui";
import { fx } from "@/lib/fx";
import { getar, sfx } from "@/lib/sfx";
import { actions, useStore, type After } from "@/lib/store";
import { speak } from "@/lib/speech";
import { triage } from "@/lib/triage";
import { useT } from "@/lib/useT";

const TARGET = 3;
const TIAP_NAPAS_MS = 4000;
const WARNA_BALON = ["#ef6f5e", "#f6b93b", "#2ba6a0"];
const R = 122;
const KELILING = 2 * Math.PI * R;

function Napas() {
  const companion = useCompanion();
  const { t, lang } = useT();
  const params = useSearchParams();
  const cekId = params.get("cek");
  const { checkins } = useStore();

  const [progress, setProgress] = useState(0); // 0..1 saat menahan
  const [held, setHeld] = useState(false);
  const [selesai, setSelesai] = useState(0);
  const [terbang, setTerbang] = useState(0);
  const [fase, setFase] = useState<"latih" | "tanya" | "akhir">("latih");
  const [after, setAfter] = useState<After | null>(null);

  const startRef = useRef(0);
  const rafRef = useRef(0);
  const balonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!held) return;
    startRef.current = performance.now();
    const tick = (now: number) => {
      setProgress(Math.min((now - startRef.current) / TIAP_NAPAS_MS, 1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [held]);

  // Nada naik dan getaran halus selama balon ditahan
  useEffect(() => {
    if (!held) return;
    sfx.napasMulai();
    getar(15);
    const id = window.setInterval(() => getar(12), 600);
    return () => {
      window.clearInterval(id);
      sfx.napasBerhenti();
      getar(0);
    };
  }, [held]);

  if (!companion) return null;

  function tekan() {
    setHeld(true);
    speak(t("napas.speak.tarik"));
  }

  function lepas() {
    if (!held) return;
    setHeld(false);
    if (progress >= 0.75) {
      const n = selesai + 1;
      setSelesai(n);
      setTerbang((t) => t + 1);
      setProgress(0);
      const r = balonRef.current?.getBoundingClientRect();
      if (r) fx.percik(r.left + r.width / 2, r.top + r.height * 0.3, WARNA_BALON[selesai % 3]);
      sfx.whoosh();
      getar([30, 40, 30]);
      if (n >= TARGET) {
        speak(t("napas.speak.hebat"));
        fx.rayakan();
        window.setTimeout(() => setFase("tanya"), 1800);
      } else {
        speak(t("napas.speak.lagi"));
      }
    } else {
      setProgress(0);
      sfx.salah();
      speak(t("napas.speak.lama"));
    }
  }

  function jawab(a: After) {
    setAfter(a);
    const cek = checkins.find((c) => c.id === cekId) ?? checkins[checkins.length - 1];
    if (cek) {
      const tr = triage({ weather: cek.weather, body: cek.body, after: a }, lang);
      actions.updateCheckin(cek.id, { after: a, level: tr.level });
    }
    actions.addStar(a === "lebih-baik" ? 2 : 1, "napas");
    setFase("akhir");
  }

  const ucap =
    fase === "tanya"
      ? t("napas.tanya")
      : selesai === 0
        ? t("napas.mulai")
        : t("napas.bagus", { n: selesai, total: TARGET });

  const scale = 0.5 + progress * 0.6;
  const warna = WARNA_BALON[selesai % 3];
  // Latar makin tenang seiring napas yang selesai
  const tone = selesai >= 2 ? "langit" : "laut";

  if (fase === "tanya") {
    return (
      <ChildShell tone="langit" back={false}>
        <Say text={ucap} mood="tenang" size={130} />
        <div className="stagger mt-6 grid gap-4">
          <button type="button" className="btn btn-laut text-2xl" onClick={() => jawab("lebih-baik")}>
            {t("napas.lebihBaik")}
          </button>
          <button type="button" className="btn btn-putih text-2xl" onClick={() => jawab("masih-berat")}>
            {t("napas.masihBerat")}
          </button>
        </div>
      </ChildShell>
    );
  }

  if (fase === "akhir") {
    const berat = after === "masih-berat";
    return (
      <ChildShell tone={berat ? "laut" : "kunyit"} back={false}>
        <Say
          text={berat ? t("napas.akhir.berat") : t("napas.akhir.baik")}
          mood={berat ? "sedih" : "senang"}
          size={130}
        />
        <div className="stagger mt-6 grid gap-4">
          {berat && (
            <Link href={`/aman?dari=${cekId ?? ""}`} className="btn btn-karang text-2xl">
              {t("napas.cariDewasa")}
            </Link>
          )}
          <Link href="/rumah" className={`btn ${berat ? "btn-putih" : "btn-laut text-2xl"}`}>
            {t("umum.kembaliRumah")}
          </Link>
        </div>
      </ChildShell>
    );
  }

  return (
    <ChildShell tone={tone}>
      <Say text={ucap} mood="tenang" size={96} quiet={selesai > 0} pulse={held ? progress : 0} />

      <div className="relative mt-2 flex flex-1 flex-col items-center justify-end">
        <div className="relative grid size-[276px] place-items-center">
          {Array.from({ length: terbang }).map((_, i) => (
            <span
              key={i}
              className="anim-terbang pointer-events-none absolute bottom-10"
              style={{ left: `${10 + ((i * 31) % 60)}%` }}
              aria-hidden
            >
              <BalloonIcon size={52} color={WARNA_BALON[i % 3]} />
            </span>
          ))}

          <svg viewBox="0 0 276 276" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx={138} cy={138} r={R} fill="none" stroke="#fff" strokeWidth={14} />
            <circle cx={138} cy={138} r={R} fill="none" stroke="#1e2a4a" strokeWidth={20} strokeOpacity={0.12} />
            <circle
              cx={138}
              cy={138}
              r={R}
              fill="none"
              stroke={progress >= 0.75 ? "#7bc47f" : "#f6b93b"}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={KELILING}
              strokeDashoffset={KELILING * (1 - progress)}
            />
          </svg>

          <button
            ref={balonRef}
            type="button"
            aria-label={t("napas.aria.balon")}
            className="relative touch-none select-none outline-none"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              tekan();
            }}
            onPointerUp={lepas}
            onPointerCancel={lepas}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) tekan();
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") lepas();
            }}
          >
            <span
              className={`block transition-transform duration-100 ${held ? "" : "anim-ayun"}`}
              style={{ transform: held ? `scale(${scale})` : undefined, transformOrigin: "50% 40%" }}
            >
              <span className="block" style={{ transform: held ? undefined : `scale(${scale})` }}>
                <BalloonIcon size={200} color={warna} />
              </span>
            </span>
          </button>
        </div>

        <p className="mt-2 rounded-full border-[3px] border-tinta bg-white px-4 py-1 font-judul text-xl font-bold">
          {held ? (progress < 0.75 ? t("napas.label.tarik") : t("napas.label.lepas")) : t("napas.label.tahan")}
        </p>

        <div className="mt-4 flex gap-2" aria-label={t("napas.aria.hitung", { n: selesai, total: TARGET })}>
          {Array.from({ length: TARGET }).map((_, i) => (
            <span
              key={i}
              className={`size-5 rounded-full border-[3px] border-tinta transition-colors duration-300 ${
                i < selesai ? "anim-pop bg-kunyit" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </ChildShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Napas />
    </Suspense>
  );
}
