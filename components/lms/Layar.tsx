"use client";

import { useState, type ReactNode } from "react";
import { hitungPoin, KATALOG, KOHORT_CONTOH, PESERTA_CONTOH, SOAL } from "@/lib/akademi";
import { useStore } from "@/lib/store";
import { Ikon } from "./ikon";
import { persen, Sertifikat } from "./Kursus";
import { useL } from "./util";

export type Tampilan = "beranda" | "katalog" | "kursus" | "sertifikat" | "peringkat" | "pelatih";

function Judul({ judul, sub, aksi }: { judul: string; sub?: string; aksi?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">{judul}</h1>
        {sub && <p className="mt-1 text-sm font-medium text-teks2">{sub}</p>}
      </div>
      {aksi}
    </div>
  );
}

function Statistik({ label, nilai, ikon, sub }: { label: string; nilai: string; ikon: Parameters<typeof Ikon>[0]["nama"]; sub?: string }) {
  return (
    <div className="lms-card flex items-start gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-biru-muda text-biru">
        <Ikon nama={ikon} size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-teks2">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold">{nilai}</p>
        {sub && <p className="mt-0.5 text-xs font-medium text-teks2">{sub}</p>}
      </div>
    </div>
  );
}

function sapaan(jam: number, l: (id: string, en: string) => string) {
  if (jam < 11) return l("Selamat pagi", "Good morning");
  if (jam < 15) return l("Selamat siang", "Good afternoon");
  if (jam < 19) return l("Selamat sore", "Good evening");
  return l("Selamat malam", "Good evening");
}

export function Beranda({ ke }: { ke: (v: Tampilan) => void }) {
  const { l, p } = useL();
  const { akademi: a } = useStore();
  const [jam] = useState(() => new Date().getHours());
  const [cari, setCari] = useState("");
  const selesai = a.tahap === "selesai";
  const hasilCari = cari.trim()
    ? KATALOG.filter((k) => `${k.judul.id} ${k.judul.en}`.toLowerCase().includes(cari.trim().toLowerCase()))
    : [];

  return (
    <div>
      <section className="lms-card relative overflow-hidden p-6 md:p-8">
        <svg aria-hidden viewBox="0 0 320 200" className="pointer-events-none absolute -right-6 -top-4 hidden h-48 text-biru md:block">
          <circle cx="230" cy="90" r="78" fill="currentColor" fillOpacity="0.07" />
          <circle cx="270" cy="140" r="46" fill="currentColor" fillOpacity="0.1" />
          <path d="M214 106c-24-17-36-30-36-44 0-11 8-18 18-18 8 0 14 4 18 11 4-7 10-11 18-11 10 0 18 7 18 18 0 14-12 27-36 44z" fill="currentColor" fillOpacity="0.85" />
        </svg>
        <p className="text-sm font-semibold text-teks2">
          {sapaan(jam, l)},
        </p>
        <h1 className="mt-0.5 text-3xl font-extrabold">{a.nama || l("Peserta", "Participant")}</h1>
        <p className="mt-1 text-sm font-medium text-teks2">
          {l("Siap belajar menjaga kesehatan mental anak hari ini?", "Ready to learn how to support children's mental health today?")}
        </p>
        <div className="relative mt-6 max-w-xl">
          <Ikon nama="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-teks2" />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder={l("Apa yang ingin Anda pelajari hari ini?", "What would you like to learn today?")}
            aria-label={l("Cari kursus", "Search courses")}
            className="lms-input pl-10"
          />
        </div>
        {cari.trim() && (
          <ul className="mt-3 max-w-xl overflow-hidden rounded-xl border border-garis bg-white">
            {hasilCari.length === 0 && <li className="px-4 py-3 text-sm font-medium text-teks2">{l("Tidak ada kursus yang cocok.", "No matching courses.")}</li>}
            {hasilCari.map((k) => (
              <li key={k.id} className="border-b border-garis last:border-0">
                <button
                  type="button"
                  disabled={!k.tersedia}
                  onClick={() => ke("kursus")}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold hover:bg-abu disabled:cursor-default disabled:text-teks2 disabled:hover:bg-white"
                >
                  {p(k.judul)}
                  {!k.tersedia && <span className="lms-chip !bg-abu !text-teks2">{l("Segera hadir", "Coming soon")}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="lms-card p-6">
          <h2 className="text-lg font-bold">{l("Kursus wajib", "Mandatory courses")}</h2>
          <p className="mt-3 text-sm font-medium text-teks2">{l("Anda masih punya", "You still have")}</p>
          <p className="text-3xl font-extrabold">
            {selesai ? l("0 kursus belum selesai", "0 courses undone") : l("1 kursus belum selesai", "1 course undone")}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-biru">
            <Ikon nama="calendar" size={16} />
            {l("Tenggat terdekat 30 Okt 2026 (contoh)", "Nearest deadline 30 Oct 2026 (sample)")}
          </p>
          <p className="mt-4 flex gap-2 rounded-xl bg-biru-muda px-4 py-3 text-sm font-medium text-biru-tua">
            <Ikon nama="info" size={18} className="mt-0.5 shrink-0" />
            {selesai
              ? l("Kerja bagus! Semua kursus wajib sudah selesai.", "Well done! All mandatory courses are complete.")
              : l("Selesaikan kursus sebelum tenggat agar tidak terlewat.", "Finish the course before the deadline so you don't miss out.")}
          </p>
          <button type="button" className="lms-btn mt-5 w-full" onClick={() => ke("kursus")}>
            {l("Lihat kursus", "View courses")}
          </button>
        </section>

        <section className="lms-card p-6">
          <h2 className="text-lg font-bold">{l("Kemajuan saya", "My progress")}</h2>
          <p className="mt-3 text-sm font-medium text-teks2">{l("Lanjutkan belajar dan tingkatkan kemampuan Anda", "Continue your journey and improve your skills")}</p>
          <div className="mt-4 rounded-xl border border-garis p-4">
            <p className="text-sm font-bold">{p(KATALOG[0].judul)}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-garis">
                <span className="block h-full rounded-full bg-biru transition-all" style={{ width: `${persen(a.tahap)}%` }} />
              </span>
              <span className="text-sm font-bold">{persen(a.tahap)}%</span>
            </div>
          </div>
          <button type="button" className="lms-btn-ghost mt-5 w-full" onClick={() => ke("kursus")}>
            <Ikon nama="play" size={14} />
            {a.tahap === "mulai" ? l("Mulai belajar", "Start learning") : selesai ? l("Tinjau kursus", "Review course") : l("Lanjutkan", "Continue")}
          </button>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Statistik label={l("Poin saya", "My points")} nilai={String(hitungPoin(a))} ikon="trophy" />
        <Statistik
          label={l("Skor pre → post", "Pre → post score")}
          nilai={`${a.pre ?? "-"} → ${a.post ?? "-"}`}
          ikon="chart"
          sub={l(`dari ${SOAL.length} soal`, `out of ${SOAL.length} questions`)}
        />
        <Statistik label={l("Sertifikat", "Certificate")} nilai={selesai ? l("Tersedia", "Available") : l("Belum", "Not yet")} ikon="award" />
      </div>
    </div>
  );
}

export function Katalog({ ke }: { ke: (v: Tampilan) => void }) {
  const { l, p } = useL();
  return (
    <div>
      <Judul judul={l("Jelajahi kursus", "Explore courses")} sub={l("Modul dikembangkan bertahap bersama ahli.", "Modules are being developed step by step with experts.")} />
      <ul className="grid gap-5 md:grid-cols-2">
        {KATALOG.map((k) => (
          <li key={k.id} className="lms-card flex flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="lms-chip">{p(k.level)}</span>
              {k.tersedia ? (
                <span className="text-xs font-bold text-hijau">{l("Tersedia", "Available")}</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-teks2">
                  <Ikon nama="lock" size={13} /> {l("Segera hadir", "Coming soon")}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug">{p(k.judul)}</h2>
            <p className="mt-1 flex-1 text-sm font-medium leading-relaxed text-teks2">{p(k.deskripsi)}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-teks2">
                <Ikon nama="clock" size={15} /> {k.menit} {l("menit", "min")}
              </span>
              <button type="button" disabled={!k.tersedia} className="lms-btn" onClick={() => ke("kursus")}>
                {l("Buka", "Open")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SertifikatHalaman({ ke }: { ke: (v: Tampilan) => void }) {
  const { l } = useL();
  const { akademi: a } = useStore();
  return (
    <div>
      <Judul judul={l("Sertifikat", "Certificate")} sub={l("Sertifikat latihan Anda.", "Your practice certificate.")} />
      {a.tahap === "selesai" ? (
        <Sertifikat />
      ) : (
        <div className="lms-card flex flex-col items-center p-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-biru-muda text-biru">
            <Ikon nama="lock" size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold">{l("Sertifikat belum tersedia", "Certificate not available yet")}</h2>
          <p className="mt-1 max-w-sm text-sm font-medium text-teks2">
            {l("Selesaikan kursus (termasuk post-test) untuk mendapatkan sertifikat latihan.", "Complete the course (including the post-test) to get your practice certificate.")}
          </p>
          <button type="button" className="lms-btn mt-5" onClick={() => ke("kursus")}>
            {l("Lanjut ke kursus", "Go to course")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Peringkat() {
  const { l } = useL();
  const { akademi: a } = useStore();
  const saya = { nama: a.nama || l("Anda", "You"), sekolah: "-", poin: hitungPoin(a), saya: true };
  const semua = [...PESERTA_CONTOH.map((x) => ({ ...x, saya: false })), saya].sort((x, y) => y.poin - x.poin);
  return (
    <div>
      <Judul judul={l("Papan peringkat", "Leaderboard")} sub={l("Peserta dengan poin tertinggi.", "Participants with the highest points.")} />
      <p className="mb-4 rounded-xl bg-kuning-muda px-4 py-2 text-sm font-semibold text-kuning">
        {l("Data peserta lain adalah contoh untuk demo, bukan data nyata.", "Other participants are sample data for the demo, not real data.")}
      </p>
      <ol className="lms-card divide-y divide-garis overflow-hidden">
        {semua.map((x, i) => (
          <li key={x.nama + i} className={`flex items-center gap-4 px-5 py-3 ${x.saya ? "bg-biru-muda" : ""}`}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${i < 3 ? "bg-kuning-muda text-kuning" : "bg-abu text-teks2"}`}>{i + 1}</span>
            <span className="flex-1 text-sm font-bold">
              {x.nama} {x.saya && <span className="lms-chip ml-1">{l("Anda", "You")}</span>}
            </span>
            <span className="hidden text-sm font-medium text-teks2 sm:block">{x.sekolah}</span>
            <span className="w-20 text-right text-sm font-extrabold">{x.poin} {l("poin", "pts")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Pelatih() {
  const { l, p } = useL();
  const { akademi: a } = useStore();
  const { pre, post, peserta, selesai } = KOHORT_CONTOH;
  const rata = (arr: number[]) => (arr.reduce((s, x) => s + x, 0) / 100).toFixed(1);
  return (
    <div>
      <Judul judul={l("Dashboard pelatih", "Trainer dashboard")} sub={l("Pantau kemajuan dan efektivitas pelatihan guru.", "Track teacher progress and training effectiveness.")} />
      <p className="mb-5 rounded-xl bg-kuning-muda px-4 py-2 text-sm font-semibold text-kuning">
        {l("Data contoh untuk demo, bukan hasil nyata.", "Sample data for the demo, not real results.")}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Statistik label={l("Peserta", "Participants")} nilai={String(peserta)} ikon="users" />
        <Statistik label={l("Menyelesaikan", "Completed")} nilai={`${selesai} (${Math.round((selesai / peserta) * 100)}%)`} ikon="check" />
        <Statistik
          label={l("Rata-rata skor", "Average score")}
          nilai={`${rata(pre)} → ${rata(post)}`}
          ikon="chart"
          sub={l(`dari ${SOAL.length} soal`, `out of ${SOAL.length} questions`)}
        />
      </div>

      <section className="lms-card mt-6 p-6">
        <h2 className="text-lg font-bold">{l("Persen benar per soal", "Percent correct per question")}</h2>
        <ul className="mt-4 grid gap-5 lg:grid-cols-2">
          {SOAL.map((s, i) => (
            <li key={i}>
              <p className="text-sm font-semibold">
                {i + 1}. {p(s.q).slice(0, 80)}…
              </p>
              {[
                { v: pre[i], c: "bg-kuning", n: "Pre" },
                { v: post[i], c: "bg-biru", n: "Post" },
              ].map((b) => (
                <div key={b.n} className="mt-1.5 flex items-center gap-2">
                  <span className="w-10 text-xs font-bold text-teks2">{b.n}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-garis">
                    <span className={`block h-full rounded-full ${b.c}`} style={{ width: `${b.v}%` }} />
                  </span>
                  <span className="w-10 text-right text-xs font-bold">{b.v}%</span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <section className="lms-card mt-6 overflow-hidden">
        <h2 className="px-6 pt-5 text-lg font-bold">{l("Peserta", "Participants")}</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-[520px] text-left text-sm">
            <thead className="bg-abu text-xs font-bold uppercase tracking-wider text-teks2">
              <tr>
                <th className="px-6 py-2.5">{l("Nama", "Name")}</th>
                <th className="px-3 py-2.5">{l("Sekolah", "School")}</th>
                <th className="px-3 py-2.5">Pre</th>
                <th className="px-3 py-2.5">Post</th>
                <th className="px-6 py-2.5 text-right">{l("Poin", "Points")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis font-medium">
              {a.pre !== undefined && (
                <tr className="bg-biru-muda">
                  <td className="px-6 py-3 font-bold">
                    {a.nama || l("Anda", "You")} <span className="lms-chip ml-1">{l("nyata", "real")}</span>
                  </td>
                  <td className="px-3 py-3">-</td>
                  <td className="px-3 py-3">{a.pre}</td>
                  <td className="px-3 py-3">{a.post ?? "-"}</td>
                  <td className="px-6 py-3 text-right font-bold">{hitungPoin(a)}</td>
                </tr>
              )}
              {PESERTA_CONTOH.map((x) => (
                <tr key={x.nama}>
                  <td className="px-6 py-3">{x.nama}</td>
                  <td className="px-3 py-3">{x.sekolah}</td>
                  <td className="px-3 py-3">{x.pre}</td>
                  <td className="px-3 py-3">{x.post}</td>
                  <td className="px-6 py-3 text-right">{x.poin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
