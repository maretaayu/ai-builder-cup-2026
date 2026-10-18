"use client";

import { useMemo, useState } from "react";
import { Creature } from "@/components/Creature";
import { StarIcon } from "@/components/Icons";
import { useL } from "@/components/lms/util";
import { buatRuang, useAnggota, type RuangAnak } from "@/lib/ruang";
import { pesanGalat } from "@/lib/sesi";
import { LOKAL } from "@/lib/useT";

const KEGIATAN: Record<string, [string, string]> = {
  cuaca: ["Cek cuaca hati", "Weather check-in"],
  napas: ["Latihan napas", "Breathing"],
  tebak: ["Tebak perasaan", "Guess the feeling"],
  cerita: ["Cerita pendek", "Short stories"],
  ceritaAjaib: ["Cerita Ajaib", "Magic Story"],
  tanya: ["Tanya teman", "Ask your friend"],
  aman: ["Minta bicara", "Asked to talk"],
};

function KartuAnak({ anak, aktif, onPilih }: { anak: RuangAnak; aktif: boolean; onPilih: () => void }) {
  const { l, lang } = useL();
  const anggota = useAnggota(anak.kode);
  const [tersalin, setTersalin] = useState("");
  const tautan = typeof window !== "undefined" ? `${window.location.origin}/gabung?kode=${anak.kode}` : "";
  const waktu = useMemo(() => new Intl.DateTimeFormat(LOKAL[lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), [lang]);

  const salin = (teks: string, id: string) => {
    void navigator.clipboard?.writeText(teks);
    setTersalin(id);
    window.setTimeout(() => setTersalin(""), 1800);
  };

  const perangkat = anggota[0];
  const bintang = anggota.reduce((n, a) => n + (a.stars ?? 0), 0);
  const kegiatan = Object.entries(KEGIATAN).map(([k, [id, en]]) => ({
    k,
    label: lang === "en" ? en : id,
    n: anggota.reduce((n, a) => n + (a.progres?.[k] ?? 0), 0),
  }));
  const total = kegiatan.reduce((n, x) => n + x.n, 0);
  const maks = Math.max(1, ...kegiatan.map((x) => x.n));
  const terakhir = Math.max(0, ...anggota.map((a) => a.aktifTs ?? 0));

  return (
    <li className={`rounded-3xl border-[3px] border-tinta bg-white p-4 shadow-[0_4px_0_var(--ink)] ${aktif ? "ring-4 ring-laut/40" : ""}`}>
      <div className="flex items-center gap-3">
        {perangkat ? (
          <Creature species={perangkat.species} mood="senang" size={56} />
        ) : (
          <span className="grid size-14 place-items-center rounded-2xl bg-abu text-2xl font-extrabold">{anak.nama[0]?.toUpperCase() ?? "?"}</span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-extrabold">{anak.nama}</h3>
          <p className="text-sm font-bold text-tinta-lembut">
            {perangkat
              ? l(`Terhubung · teman: ${perangkat.nama}`, `Connected · friend: ${perangkat.nama}`)
              : l("Menunggu anak memasukkan kode", "Waiting for the child to enter the code")}
          </p>
        </div>
        <span className={`rounded-full border-2 border-tinta px-2.5 py-0.5 text-xs font-extrabold ${perangkat ? "bg-daun" : "bg-kunyit"}`}>
          {perangkat ? l("Terhubung", "Connected") : l("Belum", "Pending")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-xl bg-laut-muda px-3 py-1 font-judul text-lg font-extrabold tracking-[0.25em]" aria-label={l(`Kode untuk ${anak.nama}`, `Code for ${anak.nama}`)}>
          {anak.kode}
        </span>
        <button type="button" className="btn btn-putih btn-kecil" onClick={() => salin(anak.kode, "kode")}>
          {tersalin === "kode" ? l("Tersalin", "Copied") : l("Salin kode", "Copy code")}
        </button>
        <button type="button" className="btn btn-putih btn-kecil" onClick={() => salin(tautan, "tautan")}>
          {tersalin === "tautan" ? l("Tersalin", "Copied") : l("Salin tautan", "Copy link")}
        </button>
      </div>

      {perangkat && (
        <div className="mt-4 border-t-2 border-tinta/15 pt-3">
          <h4 className="font-judul text-sm font-bold uppercase tracking-wide text-tinta-lembut">{l("Progres belajar", "Learning progress")}</h4>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-bold">
            <span className="flex items-center gap-1"><StarIcon size={20} /> {l(`${bintang} bintang`, `${bintang} stars`)}</span>
            <span>{l(`${total} kegiatan selesai`, `${total} activities done`)}</span>
            {terakhir > 0 && <span className="text-sm text-tinta-lembut">{l("Terakhir aktif", "Last active")}: {waktu.format(terakhir)}</span>}
          </p>
          {total === 0 ? (
            <p className="mt-2 text-sm font-semibold text-tinta-lembut">{l("Belum ada kegiatan. Progres muncul setelah anak mulai bermain.", "No activity yet. Progress shows up once the child starts playing.")}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {kegiatan.filter((x) => x.n > 0).map((x) => (
                <li key={x.k} className="flex items-center gap-2 text-sm font-bold">
                  <span className="w-32 shrink-0">{x.label}</span>
                  <span className="h-3.5 flex-1 overflow-hidden rounded-full border-2 border-tinta bg-white">
                    <span className="block h-full bg-laut" style={{ width: `${(x.n / maks) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right font-extrabold">{x.n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button type="button" className="btn btn-laut btn-kecil mt-4" onClick={onPilih}>
        {l(`Lihat sinyal & tren ${anak.nama}`, `View ${anak.nama}'s signals & trends`)}
      </button>
    </li>
  );
}

export function AnakTab({ daftar, galatDaftar, kodeAktif, onPilih, onLihat }: { daftar: RuangAnak[]; galatDaftar?: string; kodeAktif?: string; onPilih: (kode: string) => void; onLihat: (kode: string) => void }) {
  const { l, lang } = useL();
  const [nama, setNama] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");

  async function tambah() {
    const n = nama.trim();
    if (n.length < 2 || sibuk) return;
    setSibuk(true);
    setGalat("");
    try {
      const kode = await buatRuang(n);
      setNama("");
      onPilih(kode);
    } catch (e) {
      setGalat(pesanGalat(e, lang));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="mt-4">
      <form
        className="rounded-3xl border-[3px] border-tinta bg-white p-4 shadow-[0_4px_0_var(--ink)]"
        onSubmit={(e) => {
          e.preventDefault();
          void tambah();
        }}
      >
        <label htmlFor="nama-anak" className="font-judul text-xl font-bold">{l("Tambah anak", "Add a child")}</label>
        <p className="mt-1 text-sm font-semibold text-tinta-lembut">
          {l("Tiap anak mendapat kode unik sendiri. Masukkan kode itu di perangkat anak.", "Each child gets their own unique code. Enter that code on the child's device.")}
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="nama-anak"
            value={nama}
            onChange={(e) => setNama(e.target.value.slice(0, 30))}
            placeholder={l("Nama anak, mis. Aisyah", "Child's name, e.g. Aisha")}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-2xl border-[3px] border-tinta px-3 py-2 text-lg font-semibold outline-none focus:border-laut"
          />
          <button type="submit" disabled={sibuk || nama.trim().length < 2} className="btn btn-laut disabled:opacity-40">
            {sibuk ? l("Membuat...", "Creating...") : l("Buat kode", "Create code")}
          </button>
        </div>
        {galat && <p role="alert" className="mt-2 text-sm font-bold text-merah">{galat}</p>}
      </form>

      {galatDaftar && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-merah">
          {galatDaftar === "permission-denied"
            ? l("Daftar anak ditolak oleh aturan Firestore. Deploy firestore.rules terbaru (firebase deploy --only firestore:rules), lalu muat ulang.", "The children list was denied by Firestore rules. Deploy the latest firestore.rules (firebase deploy --only firestore:rules), then reload.")
            : l("Daftar anak gagal dimuat. Periksa koneksi lalu muat ulang.", "Couldn't load the children list. Check your connection and reload.")}
        </p>
      )}

      <h2 className="mt-6 font-judul text-xl font-bold">{l(`Anak saya (${daftar.length})`, `My children (${daftar.length})`)}</h2>
      {daftar.length === 0 ? (
        <p className="mt-2 rounded-2xl border-[3px] border-dashed border-tinta/40 p-5 font-semibold text-tinta-lembut">
          {l("Belum ada anak. Tambahkan nama anak di atas untuk mendapat kodenya.", "No children yet. Add a child's name above to get their code.")}
        </p>
      ) : (
        <ul className="mt-2 grid gap-3">
          {daftar.map((a) => (
            <KartuAnak key={a.kode} anak={a} aktif={a.kode === kodeAktif} onPilih={() => onLihat(a.kode)} />
          ))}
        </ul>
      )}
    </div>
  );
}
