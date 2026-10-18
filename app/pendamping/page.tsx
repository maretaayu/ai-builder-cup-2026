"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnakTab } from "@/components/AnakTab";
import { useL } from "@/components/lms/util";
import { GerbangDewasa, useGerbangDewasa } from "@/components/GerbangDewasa";
import { LangSwitch } from "@/components/LangSwitch";
import { WeatherIcon } from "@/components/Icons";
import { actions, useStore, type Checkin, type Level, type Signal, type Weather } from "@/lib/store";
import type { Jawaban } from "@/lib/copilot";
import { perbaruiSinyal, useCekinRuang, useDaftarAnak, useSinyalRuang } from "@/lib/ruang";
import { useSesi } from "@/lib/sesi";
import { LOKAL, useT } from "@/lib/useT";

type Tab = "anak" | "sinyal" | "tanya" | "tren";
const CUACA: Weather[] = ["cerah", "mendung", "hujan", "badai"];

const LEVEL_CLS: Record<Level, string> = {
  aman: "bg-daun",
  perhatian: "bg-kunyit",
  segera: "bg-karang",
};

type Jarak = { kode: string; sinyal: Signal[]; galat: string };

function Sinyal({ remote }: { remote?: Jarak }) {
  const { signals, companion } = useStore();
  const { t, lang } = useT();
  const waktu = useMemo(
    () => new Intl.DateTimeFormat(LOKAL[lang], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    [lang],
  );
  const urut = [...(remote ? remote.sinyal : signals)].sort((x, y) => y.ts - x.ts);
  if (remote?.galat) {
    return (
      <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-5 text-sm font-semibold text-merah">
        {remote.galat === "permission-denied"
          ? t("pend.koneksi.ditolak")
          : t("pend.koneksi.gagal")}
      </p>
    );
  }
  if (urut.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border-[3px] border-dashed border-tinta/40 p-5 font-semibold text-tinta-lembut">
        {t("pend.sinyal.kosong")}
      </p>
    );
  }
  return (
    <ul className="mt-4 grid gap-3">
      {urut.map((s) => {
        const dewasa = t(`dewasa.${s.to as "ibu"}`);
        return (
          <li key={s.id} className="rounded-3xl border-[3px] border-tinta bg-white p-4 shadow-[0_4px_0_var(--ink)]">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border-2 border-tinta px-3 py-0.5 text-sm font-extrabold ${LEVEL_CLS[s.level]}`}>
                {t(`pend.level.${s.level}`)}
              </span>
              <span className="text-sm font-bold text-tinta-lembut">{waktu.format(s.ts)}</span>
            </div>
            <p className="mt-2 text-lg font-extrabold">
              {(s as Signal & { nama?: string }).nama ?? companion?.name
                ? t("pend.sinyal.judul", { nama: (s as Signal & { nama?: string }).nama ?? companion?.name ?? "", dewasa })
                : t("pend.sinyal.judulUmum", { dewasa })}
            </p>
            {s.weather && (
              <p className="mt-1 flex items-center gap-2 font-semibold text-tinta-lembut">
                <WeatherIcon weather={s.weather} size={28} />
                {t("pend.sinyal.cuaca", { cuaca: t(`cuaca.${s.weather}`) })}
                {s.body && s.body !== "tidak" ? t("pend.sinyal.terasa", { badan: t(`badanKecil.${s.body}`) }) : ""}
              </p>
            )}
            {s.alasan && <p className="mt-2 font-bold">{s.alasan}</p>}
            {s.saran && (
              <div className="mt-2 rounded-2xl border-2 border-tinta bg-laut-muda px-3 py-2">
                <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">
                  {t("pend.sinyal.saran")}
                  <span className="ml-2 rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-xs normal-case tracking-normal">
                    {s.ai ? t("pend.sinyal.gemini") : t("pend.sinyal.dasar")}
                  </span>
                </p>
                <p className="mt-1 font-semibold">{s.saran}</p>
              </div>
            )}
            <p className="mt-2 text-sm font-semibold text-tinta-lembut">{t("pend.sinyal.privasi")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.status !== "ditanggapi" && (
                <button type="button" className="btn btn-laut btn-kecil" onClick={() => (remote ? void perbaruiSinyal(remote.kode, s.id, { status: "ditanggapi" }).catch(() => {}) : actions.setSignalStatus(s.id, "ditanggapi"))}>
                  {t("pend.sinyal.temui")}
                </button>
              )}
              {s.status === "ditanggapi" && <span className="font-extrabold text-daun-tua">{t("pend.sinyal.ditanggapi")}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Tanya() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Jawaban | null>(null);
  const [err, setErr] = useState("");

  async function kirim(teks: string) {
    if (!teks.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: teks, lang }),
      });
      if (!r.ok) throw new Error();
      setRes((await r.json()) as Jawaban);
    } catch {
      setErr(t("pend.tanya.gagal"));
    } finally {
      setLoading(false);
    }
  }

  const contoh = [t("pend.tanya.contoh1"), t("pend.tanya.contoh2"), t("pend.tanya.contoh3"), t("pend.tanya.contoh4")];

  return (
    <div className="mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void kirim(q);
        }}
      >
        <label htmlFor="q" className="font-judul text-xl font-bold">
          {t("pend.tanya.label")}
        </label>
        <textarea
          id="q"
          rows={3}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-2 w-full rounded-2xl border-[3px] border-tinta p-3 text-lg font-semibold outline-none focus:border-laut"
          placeholder={t("pend.tanya.placeholder")}
        />
        <button type="submit" disabled={loading || !q.trim()} className="btn btn-laut mt-2 w-full disabled:opacity-40">
          {loading ? t("pend.tanya.mencari") : t("pend.tanya.minta")}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {contoh.map((c) => (
          <button
            key={c}
            type="button"
            className="rounded-full border-2 border-tinta bg-white px-3 py-1 text-left text-sm font-bold"
            onClick={() => {
              setQ(c);
              void kirim(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {err && <p className="mt-4 font-bold text-karang">{err}</p>}

      {res && (
        <article className="anim-muncul mt-5 rounded-3xl border-[3px] border-tinta bg-white p-4 shadow-[0_4px_0_var(--ink)]">
          {res.darurat && (
            <p className="mb-3 rounded-2xl border-[3px] border-tinta bg-karang px-3 py-2 font-extrabold">{t("pend.tanya.darurat")}</p>
          )}
          {res.oleh && (
            <span className="mb-2 inline-block rounded-full border-2 border-tinta bg-laut-muda px-2 py-0.5 text-xs font-extrabold">
              {res.oleh === "gemini" ? t("pend.tanya.gemini") : t("pend.tanya.korpus")}
            </span>
          )}
          <h2 className="text-2xl font-extrabold">{res.judul}</h2>
          <p className="mt-2 font-semibold">{res.ringkas}</p>
          {res.langkah.length > 0 && (
            <>
              <h3 className="mt-4 font-judul text-lg font-bold">{t("pend.tanya.langkah")}</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 font-semibold">
                {res.langkah.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ol>
            </>
          )}
          {res.hindari.length > 0 && (
            <>
              <h3 className="mt-4 font-judul text-lg font-bold">{t("pend.tanya.hindari")}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 font-semibold">
                {res.hindari.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          )}
          {res.kalimat?.length > 0 && (
            <>
              <h3 className="mt-4 font-judul text-lg font-bold">{t("pend.tanya.kalimat")}</h3>
              <ul className="mt-1 grid gap-2">
                {res.kalimat.map((k) => (
                  <li key={k} className="flex items-start justify-between gap-3 rounded-2xl bg-laut-muda px-3 py-2 font-semibold">
                    <span>&ldquo;{k}&rdquo;</span>
                    <button
                      type="button"
                      className="shrink-0 rounded-full border-2 border-tinta bg-white px-2.5 py-0.5 text-xs font-extrabold"
                      onClick={(e) => {
                        void navigator.clipboard?.writeText(k);
                        e.currentTarget.textContent = t("pend.tanya.tersalin");
                      }}
                    >
                      {t("pend.tanya.salin")}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className="mt-4 font-judul text-lg font-bold">{t("pend.tanya.rujuk")}</h3>
          <p className="font-semibold">{res.rujuk}</p>
          {res.cocok && (
            <p className="mt-4 border-t-2 border-tinta/20 pt-3 text-sm font-bold text-tinta-lembut">
              {t("pend.tanya.sumber", { sumber: res.sumber })}
            </p>
          )}
        </article>
      )}
    </div>
  );
}

function Tren({ remoteCekin }: { remoteCekin?: Checkin[] }) {
  const { checkins: lokal } = useStore();
  const checkins = remoteCekin ?? lokal;
  const { t, lang } = useT();
  const [terisi, setTerisi] = useState(false);
  const [rk, setRk] = useState<{ ringkasan: string; saran: string; ai: boolean } | null>(null);
  const [muat, setMuat] = useState(false);
  const [sekarang] = useState(() => Date.now());
  const hari = useMemo(() => new Intl.DateTimeFormat(LOKAL[lang], { weekday: "short" }), [lang]);

  const minggu = useMemo(() => {
    const batas = sekarang - 7 * 86_400_000;
    return checkins.filter((c) => c.ts >= batas).sort((a, b) => a.ts - b.ts);
  }, [checkins, sekarang]);

  const hitung = (w: Weather) => minggu.filter((c) => c.weather === w).length;
  const perhatian = minggu.filter((c) => c.level !== "aman").length;
  const maks = Math.max(1, ...CUACA.map(hitung));
  const warna: Record<Weather, string> = { cerah: "#f6b93b", mendung: "#b9c8dc", hujan: "#3a8fd1", badai: "#7c6fb0" };

  return (
    <div className="mt-4">
      {minggu.length === 0 ? (
        <p className="rounded-2xl border-[3px] border-dashed border-tinta/40 p-5 font-semibold text-tinta-lembut">
          {t("pend.tren.kosong")}
        </p>
      ) : (
        <>
          <p className="text-lg font-bold">{t("pend.tren.ringkas", { n: minggu.length, p: perhatian })}</p>
          <ul className="mt-4 grid gap-3">
            {CUACA.map((w) => (
              <li key={w} className="flex items-center gap-3">
                <WeatherIcon weather={w} size={34} />
                <span className="w-20 font-bold">{t(`cuaca.${w}`)}</span>
                <span className="h-5 flex-1 overflow-hidden rounded-full border-[3px] border-tinta bg-white">
                  <span className="block h-full" style={{ width: `${(hitung(w) / maks) * 100}%`, background: warna[w] }} />
                </span>
                <span className="w-5 text-right font-extrabold">{hitung(w)}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-judul text-lg font-bold">{t("pend.tren.harian")}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {minggu.map((c) => (
              <li key={c.id} className="flex flex-col items-center rounded-2xl border-[3px] border-tinta bg-white px-2 py-1">
                <span className="text-xs font-extrabold uppercase">{hari.format(c.ts)}</span>
                <WeatherIcon weather={c.weather} size={34} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-laut btn-kecil mt-5"
            disabled={muat}
            onClick={async () => {
              setMuat(true);
              try {
                const r = await fetch("/api/ringkasan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    lang,
                    cerah: hitung("cerah"),
                    mendung: hitung("mendung"),
                    hujan: hitung("hujan"),
                    badai: hitung("badai"),
                    perhatian,
                  }),
                });
                if (r.ok) setRk(await r.json());
              } finally {
                setMuat(false);
              }
            }}
          >
            {muat ? t("pend.tren.menyusun") : t("pend.tren.buat")}
          </button>
          {rk && (
            <div className="anim-muncul mt-3 rounded-3xl border-[3px] border-tinta bg-white p-4 shadow-[0_4px_0_var(--ink)]">
              <span className="mb-2 inline-block rounded-full border-2 border-tinta bg-laut-muda px-2 py-0.5 text-xs font-extrabold">
                {rk.ai ? t("pend.tren.gemini") : t("pend.tren.dasar")}
              </span>
              <p className="font-semibold">{rk.ringkasan}</p>
              <p className="mt-2 font-semibold">{rk.saran}</p>
            </div>
          )}
          <p className="mt-4 text-sm font-semibold text-tinta-lembut">{t("pend.tren.privasi")}</p>
        </>
      )}
      {!remoteCekin && (
        <>
          <button
            type="button"
            className="btn btn-putih btn-kecil mt-5"
            onClick={() => {
              actions.seedDemo();
              setTerisi(true);
            }}
          >
            {t("pend.tren.contoh")}
          </button>
          {terisi && <span className="ml-2 text-sm font-bold text-daun-tua">{t("pend.tren.contohOk")}</span>}
        </>
      )}
    </div>
  );
}

export default function Pendamping() {
  const { ok, lolos } = useGerbangDewasa();
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "sinyal";
    const q = new URLSearchParams(window.location.search).get("tab");
    return q === "anak" || q === "tanya" || q === "tren" ? q : "sinyal";
  });
  const { signals } = useStore();
  const { t } = useT();
  const sesi = useSesi();
  const { l } = useL();
  const dewasa = Boolean(sesi.user && !sesi.user.anonim);
  const { anak: anakTersimpan, galat: galatAnak } = useDaftarAnak(dewasa ? sesi.user?.uid : undefined);
  // Ruang yang sudah ada di profil tetap tampil walau daftar belum termuat (atau ditolak aturan).
  const kodeProfil = sesi.profil?.ruangKode;
  const daftarAnak =
    dewasa && kodeProfil && !anakTersimpan.some((a) => a.kode === kodeProfil)
      ? [{ kode: kodeProfil, nama: sesi.profil?.ruangNama ?? kodeProfil, dibuat: 0 }, ...anakTersimpan]
      : anakTersimpan;
  const [pilihan, setPilihan] = useState("");
  const kode = dewasa
    ? (daftarAnak.some((a) => a.kode === pilihan) ? pilihan : undefined) ?? sesi.profil?.ruangKode ?? daftarAnak[0]?.kode
    : undefined;
  const anakAktif = daftarAnak.find((a) => a.kode === kode);
  const live = useSinyalRuang(kode);
  const cekinLive = useCekinRuang(kode);
  const [gemini, setGemini] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((j: { gemini: boolean }) => setGemini(j.gemini))
      .catch(() => setGemini(false));
  }, []);
  const baru = (kode ? live.sinyal : signals).filter((s) => s.status === "baru").length;

  if (!ok) return <GerbangDewasa onLolos={lolos} />;

  const tabs: { id: Tab; label: string }[] = [
    ...(dewasa ? [{ id: "anak" as const, label: l(`Anak (${daftarAnak.length})`, `Children (${daftarAnak.length})`) }] : []),
    { id: "sinyal", label: baru ? t("pend.tab.sinyalN", { n: baru }) : t("pend.tab.sinyal") },
    { id: "tanya", label: t("pend.tab.tanya") },
    { id: "tren", label: t("pend.tab.tren") },
  ];

  return (
    <div className="flex flex-1 flex-col bg-krem-tua">
      <header className="flex items-center justify-between gap-2 px-4 pt-4">
        <Link href="/" className="font-bold underline">
          {t("umum.keluar")}
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full border-2 border-tinta bg-white px-2 py-0.5 text-xs font-bold">
            {gemini === null ? t("pend.ai.periksa") : gemini ? t("pend.ai.aktif") : t("pend.ai.dasar")}
          </span>
          <LangSwitch />
        </div>
      </header>
      <main className="flex-1 px-4 pb-10 pt-3">
        <p className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">{t("pend.peran")}</p>
        <h1 className="text-4xl font-extrabold">{t("pend.judul")}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
          {kode ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-hijau-muda px-3 py-1 text-hijau">
                <span className="size-2 animate-pulse rounded-full bg-hijau" />
                {t("pend.koneksi.terhubung", { ruang: anakAktif?.nama ?? sesi.profil?.ruangNama ?? "" })}
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-extrabold tracking-widest ring-1 ring-garis">{kode}</span>
            </>
          ) : (
            <>
              <span className="rounded-full bg-kuning-muda px-3 py-1 text-kuning">{t("pend.koneksi.lokal")}</span>
              <Link href="/mulai" className="text-biru underline">{t("pend.koneksi.masuk")}</Link>
            </>
          )}
        </p>
        <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`shrink-0 rounded-full border-[3px] border-tinta px-4 py-1.5 font-judul text-lg font-bold ${
                tab === x.id ? "bg-tinta text-white" : "bg-white"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        {dewasa && daftarAnak.length > 1 && tab !== "anak" && tab !== "tanya" && (
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={l("Pilih anak", "Choose a child")}>
            <span className="text-sm font-bold text-tinta-lembut">{l("Anak:", "Child:")}</span>
            {daftarAnak.map((a) => (
              <button
                key={a.kode}
                type="button"
                aria-pressed={a.kode === kode}
                onClick={() => setPilihan(a.kode)}
                className={`rounded-full border-2 border-tinta px-3 py-0.5 text-sm font-extrabold ${a.kode === kode ? "bg-laut text-white" : "bg-white"}`}
              >
                {a.nama}
              </button>
            ))}
          </div>
        )}
        {tab === "anak" && dewasa && (
          <AnakTab
            daftar={daftarAnak}
            galatDaftar={galatAnak}
            kodeAktif={kode}
            onPilih={setPilihan}
            onLihat={(k) => {
              setPilihan(k);
              setTab("sinyal");
            }}
          />
        )}
        {tab === "sinyal" && <Sinyal remote={kode ? { kode, sinyal: live.sinyal, galat: live.galat } : undefined} />}
        {tab === "tanya" && <Tanya />}
        {tab === "tren" && <Tren remoteCekin={kode ? cekinLive : undefined} />}
      </main>
    </div>
  );
}
