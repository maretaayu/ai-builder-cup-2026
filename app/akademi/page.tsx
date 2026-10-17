"use client";

import Link from "next/link";
import { useState } from "react";
import { LangSwitch } from "@/components/LangSwitch";
import { Ikon, Lambang, type NamaIkon } from "@/components/lms/ikon";
import { Kursus } from "@/components/lms/Kursus";
import { Beranda, Katalog, Pelatih, Peringkat, SertifikatHalaman, type Tampilan } from "@/components/lms/Layar";
import { useL } from "@/components/lms/util";
import { hitungPoin } from "@/lib/akademi";
import { actions, useHydrated, useStore } from "@/lib/store";

type Menu = { id: Tampilan; ikon: NamaIkon; id_: string; en: string };

const MENU: Menu[] = [
  { id: "beranda", ikon: "home", id_: "Beranda", en: "Home" },
  { id: "katalog", ikon: "compass", id_: "Jelajahi", en: "Explore" },
  { id: "kursus", ikon: "book", id_: "Kursus saya", en: "My courses" },
  { id: "sertifikat", ikon: "award", id_: "Sertifikat", en: "Certificate" },
  { id: "peringkat", ikon: "trophy", id_: "Peringkat", en: "Leaderboard" },
  { id: "pelatih", ikon: "chart", id_: "Dashboard pelatih", en: "Trainer dashboard" },
];

function Sambutan() {
  const { l } = useL();
  const [nama, setNama] = useState("");
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-biru-tua/60 p-4 backdrop-blur-sm">
      <form
        className="lms-card w-full max-w-md p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (nama.trim().length >= 2) actions.setAkademi({ nama: nama.trim() });
        }}
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-biru">
          <Lambang size={30} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">{l("Selamat datang di Baku Jaga Academy", "Welcome to Baku Jaga Academy")}</h1>
        <p className="mt-1 text-sm font-medium text-teks2">
          {l(
            "Pelatihan untuk guru dan pendamping dalam memberi pertolongan pertama emosi pada anak.",
            "Training for teachers and caregivers in giving emotional first aid to children.",
          )}
        </p>
        <label htmlFor="nama" className="mt-5 block text-sm font-semibold">
          {l("Nama Anda (untuk sertifikat)", "Your name (for the certificate)")}
        </label>
        <input id="nama" autoFocus value={nama} onChange={(e) => setNama(e.target.value.slice(0, 60))} autoComplete="off" className="lms-input mt-1" />
        <p className="mt-2 text-xs font-medium text-teks2">
          {l("Data hanya tersimpan di browser ini.", "Data is stored only in this browser.")}
        </p>
        <button type="submit" disabled={nama.trim().length < 2} className="lms-btn mt-5 w-full">
          {l("Masuk", "Continue")}
        </button>
        <Link href="/pendamping" className="mt-3 block text-center text-sm font-semibold text-biru underline">
          {l("Kembali", "Back")}
        </Link>
      </form>
    </div>
  );
}

export default function Akademi() {
  const hydrated = useHydrated();
  const { akademi: a } = useStore();
  const { l } = useL();
  const [view, setView] = useState<Tampilan>(() => {
    if (typeof window === "undefined") return "beranda";
    return new URLSearchParams(window.location.search).get("v") === "kursus" ? "kursus" : "beranda";
  });
  const [buka, setBuka] = useState(false);
  const [notif, setNotif] = useState(false);

  if (!hydrated) return <div className="flex-1" />;

  const ke = (v: Tampilan) => {
    setView(v);
    setBuka(false);
    setNotif(false);
  };
  const judulView = MENU.find((m) => m.id === view);
  const inisial = (a.nama || "?").trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const belum = a.tahap !== "selesai";

  const nav = (
    <nav className="mt-6 grid gap-1" aria-label="Menu">
      {MENU.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-current={view === m.id ? "page" : undefined}
          onClick={() => ke(m.id)}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
            view === m.id ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Ikon nama={m.ikon} size={18} />
          {l(m.id_, m.en)}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-1 print:block">
      {!a.nama && <Sambutan />}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-gradient-to-b from-biru-tua to-biru px-4 py-5 text-white lg:flex print:hidden">
        <div className="flex items-center gap-3 px-1">
          <Lambang size={38} />
          <div className="leading-tight">
            <p className="text-base font-extrabold">Baku Jaga</p>
            <p className="text-xs font-medium text-white/70">Academy</p>
          </div>
        </div>
        {nav}
        <div className="mt-auto rounded-xl bg-white/10 p-3 text-xs font-medium leading-relaxed text-white/80">
          {l("Prototipe lomba. Materi masih draf dan belum divalidasi tenaga profesional.", "Competition prototype. Content is a draft and not yet validated by professionals.")}
        </div>
      </aside>

      {/* Sidebar mobile */}
      {buka && (
        <div className="fixed inset-0 z-30 lg:hidden print:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label={l("Tutup menu", "Close menu")} className="absolute inset-0 bg-biru-tua/50" onClick={() => setBuka(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-gradient-to-b from-biru-tua to-biru px-4 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 px-1">
                <Lambang size={36} />
                <p className="text-base font-extrabold">Baku Jaga</p>
              </div>
              <button type="button" aria-label={l("Tutup menu", "Close menu")} onClick={() => setBuka(false)}>
                <Ikon nama="close" size={22} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-garis bg-white/90 px-4 py-3 backdrop-blur md:px-8 print:hidden">
          <button type="button" className="rounded-lg p-2 text-teks hover:bg-abu lg:hidden" aria-label={l("Buka menu", "Open menu")} onClick={() => setBuka(true)}>
            <Ikon nama="menu" size={22} />
          </button>
          <p className="text-sm font-semibold text-teks2">{judulView ? l(judulView.id_, judulView.en) : ""}</p>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-garis bg-white px-3 py-1.5 text-sm font-bold sm:flex">
              <Ikon nama="trophy" size={15} className="text-kuning" />
              {hitungPoin(a)} {l("poin", "pts")}
            </span>
            <LangSwitch className="!border !border-garis !text-xs" />
            <div className="relative">
              <button
                type="button"
                aria-label={l("Notifikasi", "Notifications")}
                aria-expanded={notif}
                onClick={() => setNotif((n) => !n)}
                className="relative grid size-10 place-items-center rounded-full border border-garis bg-white hover:bg-abu"
              >
                <Ikon nama="bell" size={18} />
                {belum && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-merah text-[10px] font-bold text-white">1</span>}
              </button>
              {notif && (
                <div className="lms-card absolute right-0 top-12 w-72 p-3">
                  <p className="px-2 pb-2 text-sm font-bold">{l("Notifikasi", "Notifications")}</p>
                  {belum ? (
                    <button type="button" onClick={() => ke("kursus")} className="flex w-full gap-3 rounded-xl p-2 text-left hover:bg-abu">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-kuning-muda text-kuning">
                        <Ikon nama="calendar" size={16} />
                      </span>
                      <span className="text-sm font-medium">
                        <span className="font-bold">{l("Kursus wajib menunggu", "Mandatory course waiting")}</span>
                        <br />
                        <span className="text-teks2">{l("Selesaikan sebelum 30 Okt 2026 (contoh).", "Finish before 30 Oct 2026 (sample).")}</span>
                      </span>
                    </button>
                  ) : (
                    <p className="px-2 py-3 text-sm font-medium text-teks2">{l("Tidak ada notifikasi baru.", "No new notifications.")}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-full border border-garis bg-white py-1 pl-1 pr-3">
              <span className="grid size-8 place-items-center rounded-full bg-biru text-xs font-bold text-white">{inisial}</span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-bold">{a.nama || "-"}</span>
                <span className="block text-[11px] font-medium text-teks2">{l("Guru fasilitator", "Facilitator teacher")}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8 print:p-0">
          {view === "beranda" && <Beranda ke={ke} />}
          {view === "katalog" && <Katalog ke={ke} />}
          {view === "kursus" && <Kursus />}
          {view === "sertifikat" && <SertifikatHalaman ke={ke} />}
          {view === "peringkat" && <Peringkat />}
          {view === "pelatih" && <Pelatih />}
        </main>
      </div>
    </div>
  );
}
