"use client";

import { useEffect, useRef, useState } from "react";
import { Creature, type Mood } from "@/components/Creature";
import { RUBRIK } from "@/lib/akademi";
import { actions } from "@/lib/store";
import { Ikon } from "./ikon";
import { useL } from "./util";

type Giliran = { peran: "guru" | "siswa"; teks: string };
type Balasan = { balasan: string; mood: Mood; keterbukaan: number; selesai: boolean; ai: boolean };
type Nilai = { skor: Record<"B" | "A" | "K" | "U", number>; masukan: string; contoh: string; ai: boolean };

const MAKS_GURU = 5;

/** Guru berlatih dengan siswa yang diperankan AI; wajah dan "keterbukaan" siswa berubah mengikuti respons guru. */
export function Simulasi() {
  const { l, p, lang } = useL();
  const awal: Giliran = {
    peran: "siswa",
    teks: l("Nggak ada yang mau main sama aku...", "Nobody wants to play with me..."),
  };
  const [log, setLog] = useState<Giliran[]>([awal]);
  const [teks, setTeks] = useState("");
  const [mikir, setMikir] = useState(false);
  const [mood, setMood] = useState<Mood>("sedih");
  const [buka, setBuka] = useState(0);
  const [aiAktif, setAiAktif] = useState<boolean | null>(null);
  const [selesai, setSelesai] = useState(false);
  const [nilai, setNilai] = useState<Nilai | null>(null);
  const [menilai, setMenilai] = useState(false);
  const [err, setErr] = useState("");
  const ujung = useRef<HTMLDivElement>(null);

  const giliranGuru = log.filter((g) => g.peran === "guru").length;

  useEffect(() => {
    ujung.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [log, mikir, nilai]);

  async function kirim() {
    const t = teks.trim();
    if (t.length < 2 || mikir || selesai) return;
    const baru = [...log, { peran: "guru" as const, teks: t }];
    setLog(baru);
    setTeks("");
    setMikir(true);
    setErr("");
    try {
      const r = await fetch("/api/simulasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, riwayat: baru }),
      });
      if (!r.ok) throw new Error();
      const b = (await r.json()) as Balasan;
      setLog([...baru, { peran: "siswa", teks: b.balasan }]);
      setMood(b.mood);
      setBuka(b.keterbukaan);
      setAiAktif(b.ai);
      if (b.selesai || baru.filter((g) => g.peran === "guru").length >= MAKS_GURU) setSelesai(true);
    } catch {
      setErr(l("Siswa simulasi sedang tidak merespons. Coba kirim lagi.", "The simulated student isn't responding. Please try again."));
    } finally {
      setMikir(false);
    }
  }

  async function akhiri() {
    setSelesai(true);
    setMenilai(true);
    setErr("");
    const jawaban = log
      .filter((g) => g.peran === "guru")
      .map((g) => g.teks)
      .join(" ")
      .slice(0, 800);
    try {
      const r = await fetch("/api/latihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban, lang }),
      });
      if (!r.ok) throw new Error();
      const h = (await r.json()) as Nilai;
      setNilai(h);
      const total = h.skor.B + h.skor.A + h.skor.K + h.skor.U;
      actions.setAkademi({ latihan: { skor: total, maks: 8 } });
    } catch {
      setErr(l("Gagal menilai. Coba lagi.", "Couldn't review. Please try again."));
    } finally {
      setMenilai(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-garis bg-abu p-4 text-center">
        <div className="mx-auto grid size-36 place-items-center rounded-full bg-white shadow-inner ring-1 ring-garis">
          <Creature species="nuri" mood={mood} size={120} />
        </div>
        <p className="mt-3 text-lg font-extrabold">Kiki</p>
        <p className="text-xs font-semibold text-teks2">{l("Siswa kelas 1 (simulasi AI)", "First grader (AI simulation)")}</p>

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-teks2">{l("Keterbukaan", "Openness")}</p>
        <div className="mt-1.5 flex justify-center gap-1.5" role="img" aria-label={`${buka}/3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-2.5 w-10 rounded-full transition-all duration-500 ${i < buka ? "bg-hijau" : "bg-garis"}`} />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-teks2">
          {buka === 0
            ? l("Kiki masih menutup diri.", "Kiki is still closed off.")
            : buka === 1
              ? l("Kiki mulai mau menanggapi.", "Kiki is starting to respond.")
              : buka === 2
                ? l("Kiki mulai bercerita.", "Kiki is starting to open up.")
                : l("Kiki merasa aman dan terbuka.", "Kiki feels safe and open.")}
        </p>
        {aiAktif !== null && (
          <span className="lms-chip mt-3">
            <Ikon nama="sparkle" size={13} />
            {aiAktif ? l("Diperankan Gemini", "Played by Gemini") : l("Mode dasar", "Basic mode")}
          </span>
        )}
      </aside>

      <div className="flex min-w-0 flex-col">
        <p className="rounded-xl bg-kuning-muda px-4 py-2.5 text-sm font-medium text-teks">
          {l(
            "Kiki duduk sendirian saat istirahat. Responsmu menentukan seberapa terbuka Kiki. Gunakan langkah B-A-K-U.",
            "Kiki sits alone at recess. Your responses decide how open Kiki becomes. Use the B-A-K-U steps.",
          )}
        </p>

        <div className="mt-3 max-h-[340px] min-h-[220px] overflow-y-auto rounded-2xl border border-garis bg-white p-4" aria-live="polite">
          <ul className="grid gap-3">
            {log.map((g, i) => (
              <li key={i} className={`flex ${g.peran === "guru" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed ${
                    g.peran === "guru" ? "rounded-br-md bg-biru text-white" : "rounded-bl-md bg-abu text-teks"
                  }`}
                >
                  {g.teks}
                </p>
              </li>
            ))}
            {mikir && (
              <li className="flex justify-start">
                <p className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-abu px-4 py-3" aria-label={l("Kiki sedang berpikir", "Kiki is thinking")}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="anim-naik-turun size-2 rounded-full bg-teks2" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </p>
              </li>
            )}
          </ul>
          <div ref={ujung} />
        </div>

        {!nilai && !selesai && (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void kirim();
            }}
          >
            <input
              value={teks}
              onChange={(e) => setTeks(e.target.value.slice(0, 300))}
              placeholder={l("Tulis respons Anda kepada Kiki...", "Write your response to Kiki...")}
              aria-label={l("Respons untuk Kiki", "Response to Kiki")}
              className="lms-input"
              autoComplete="off"
            />
            <button type="submit" disabled={mikir || teks.trim().length < 2} className="lms-btn shrink-0">
              {l("Kirim", "Send")}
            </button>
          </form>
        )}

        {err && <p className="mt-2 text-sm font-semibold text-merah">{err}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!nilai && (
            <button type="button" disabled={giliranGuru < 2 || menilai} className="lms-btn-ghost" onClick={() => void akhiri()}>
              {menilai ? l("Menilai...", "Reviewing...") : l("Akhiri dan nilai percakapan", "End and review the conversation")}
            </button>
          )}
          <span className="text-xs font-semibold text-teks2">
            {l(`Giliran Anda: ${giliranGuru} dari ${MAKS_GURU}`, `Your turns: ${giliranGuru} of ${MAKS_GURU}`)}
            {giliranGuru < 2 && !nilai ? l(" (minimal 2 untuk dinilai)", " (at least 2 to be reviewed)") : ""}
          </span>
          {nilai && (
            <button
              type="button"
              className="text-sm font-semibold text-biru underline"
              onClick={() => {
                setLog([awal]);
                setMood("sedih");
                setBuka(0);
                setSelesai(false);
                setNilai(null);
                setAiAktif(null);
              }}
            >
              {l("Ulangi percakapan", "Try the conversation again")}
            </button>
          )}
        </div>

        {nilai && (
          <div className="anim-muncul mt-4 rounded-xl border border-garis bg-abu p-4">
            <span className="lms-chip mb-3">
              <Ikon nama="sparkle" size={13} />
              {nilai.ai ? l("Penilaian dari Gemini", "Review from Gemini") : l("Penilaian dasar", "Basic review")}
            </span>
            <ul className="grid gap-3">
              {RUBRIK.map((r) => (
                <li key={r.huruf} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-biru text-sm font-bold text-white">{r.huruf}</span>
                  <span className="w-40 text-sm font-semibold">{p(r.nama)}</span>
                  <span className="flex flex-1 gap-1" aria-label={`${nilai.skor[r.huruf]}/2`}>
                    {[0, 1].map((n) => (
                      <span key={n} className={`h-2 flex-1 rounded-full ${n < nilai.skor[r.huruf] ? "bg-hijau" : "bg-garis"}`} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium leading-relaxed">{nilai.masukan}</p>
            <p className="mt-3 rounded-xl border border-garis bg-white px-4 py-3 text-sm font-medium leading-relaxed">
              <span className="text-xs font-bold uppercase tracking-wider text-teks2">{l("Contoh respons", "Example response")}</span>
              <br />
              {nilai.contoh}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
